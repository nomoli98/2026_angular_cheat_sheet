```ts auth-toggle.service.ts
import { computed, inject, Service, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { LoginRequest } from '@core/requests/login.request';
import { RoleEnum } from '@core/enums/role.enum';
import { isAdmin } from '@core/controllers/permissions';

// demo accounts
const ACCOUNTS: Record<RoleEnum, LoginRequest> = {
    [RoleEnum.ADMIN]: { email: 'bob@email.bob', password: 'BobIsTheBest99#' }, // admin
    [RoleEnum.USER]: { email: 'alice.dupont@mail.com', password: 'AliceIsTheBest99#' }, // user
};
const STORAGE_KEY = 'auth-toggle'; // 'on' | 'off'
const ROLE_KEY = 'auth-role'; // 'admin' | 'user'

// the 2 navbar switches
@Service()
export class AuthToggleService {
    private readonly _auth = inject(AuthService);
    private readonly _router = inject(Router);

    private readonly _busy = signal(false);
    private readonly _error = signal<string | null>(null);
    // default: admin
    private readonly _role = signal<RoleEnum>(
        this._read(ROLE_KEY) === RoleEnum.USER ? RoleEnum.USER : RoleEnum.ADMIN,
    );

    readonly user = this._auth.currentUser;
    readonly isOn = computed(() => this._auth.currentUser() !== null);
    // role from the API
    readonly isAdmin = computed(() => isAdmin(this._auth.currentUser()));
    readonly role = this._role.asReadonly();
    readonly busy = this._busy.asReadonly();
    readonly error = this._error.asReadonly();

    // app start: re-login
    async init(): Promise<void> {
        if (this._read(STORAGE_KEY) !== 'off') await this._login();
    }

    async set(on: boolean): Promise<void> {
        this._save(STORAGE_KEY, on ? 'on' : 'off');

        if (on) {
            await this._login();
            return;
        }

        this._auth.logout();
        await this._rerunGuards();
    }

    // admin switch
    async setRole(role: RoleEnum): Promise<void> {
        this._role.set(role);
        this._save(ROLE_KEY, role);

        if (!this.isOn()) return; // logged out: remember

        await this._login();
        // re-run guards
        await this._rerunGuards();
    }

    private async _login(): Promise<void> {
        this._busy.set(true);
        this._error.set(null);
        try {
            await firstValueFrom(this._auth.login(ACCOUNTS[this._role()]));
        } catch (err) {
            this._error.set(
                err instanceof HttpErrorResponse && err.status === 0
                    ? 'The API is not running: start it with npm run dev'
                    : (err as Error).message,
            );
        } finally {
            this._busy.set(false);
        }
    }

    // same-URL navigation re-runs guards
    private async _rerunGuards(): Promise<void> {
        await this._router.navigateByUrl(this._router.url, { onSameUrlNavigation: 'reload' });
    }

    // localStorage may be blocked
    private _read(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    private _save(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch {
            // ignore
        }
    }
}
```

```html auth-toggle.component.html
<div class="d-flex align-items-center gap-3">
    <!-- 1. logged in -->
    <div class="form-check form-switch mb-0" [title]="toggle.error() ?? ''">
        <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="auth-toggle"
            [checked]="toggle.isOn()"
            [disabled]="toggle.busy()"
            (change)="toggle.set($any($event.target).checked)"
        />
        <label class="form-check-label small" for="auth-toggle">
            @if (toggle.busy()) { Logging in... } @else if (toggle.user(); as user) { Logged in as
            {{ user.name }}
            <span class="badge" [class]="toggle.isAdmin() ? 'text-bg-danger' : 'text-bg-secondary'">
                {{ user.role }}
            </span>
            } @else if (toggle.error()) {
            <span class="text-danger">Login failed</span>
            } @else { Logged out }
        </label>
    </div>

    <!-- 2. admin -->
    <div class="form-check form-switch mb-0" title="On: Bob (admin) · Off: Alice (user)">
        <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="role-toggle"
            [checked]="toggle.role() === RoleEnum.ADMIN"
            [disabled]="toggle.busy() || !toggle.isOn()"
            (change)="toggle.setRole($any($event.target).checked ? RoleEnum.ADMIN : RoleEnum.USER)"
        />
        <label class="form-check-label small" for="role-toggle">Admin</label>
    </div>
</div>
```

```ts app.config.ts
export const appConfig: ApplicationConfig = {
    providers: [
        // ...
        // re-login on start
        provideAppInitializer(() => inject(AuthToggleService).init()),
    ],
};
```
