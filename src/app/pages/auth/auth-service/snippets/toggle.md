```ts auth-toggle.service.ts
import { computed, inject, Service, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { LoginRequest } from '@core/requests/login.request';
import { RoleEnum } from '@core/enums/role.enum';
import { isAdmin } from '@core/controllers/permissions';

// The demo accounts the toggles log in with (see db.seed.json)
const ACCOUNTS: Record<RoleEnum, LoginRequest> = {
  [RoleEnum.ADMIN]: { email: 'bob@email.bob', password: 'BobIsTheBest99#' }, // Bob = admin
  [RoleEnum.USER]: { email: 'alice.dupont@mail.com', password: 'AliceIsTheBest99#' }, // Alice = user
};
const STORAGE_KEY = 'auth-toggle'; // 'on' | 'off' in localStorage
const ROLE_KEY = 'auth-role'; // 'admin' | 'user' in localStorage

// Drives the two switches in the navbar, like a theme toggle:
// - "logged in" on  → real login through the API (AuthService.login)
//               off → logout, and the guard sends you to the auth page
// - "admin"     on  → logged in as Bob (admin)
//               off → logged in as Alice (simple user)
// Both choices are saved in localStorage, so they survive a refresh.
@Service()
export class AuthToggleService {
  private readonly _auth = inject(AuthService);
  private readonly _router = inject(Router);

  private readonly _busy = signal(false);
  private readonly _error = signal<string | null>(null);
  // Which account the toggle uses. Read once from localStorage (default: admin)
  private readonly _role = signal<RoleEnum>(
    this._read(ROLE_KEY) === RoleEnum.USER ? RoleEnum.USER : RoleEnum.ADMIN,
  );

  readonly user = this._auth.currentUser;
  readonly isOn = computed(() => this._auth.currentUser() !== null);
  // What the logged-in user REALLY is (from the API), not just what the switch says
  readonly isAdmin = computed(() => isAdmin(this._auth.currentUser()));
  readonly role = this._role.asReadonly();
  readonly busy = this._busy.asReadonly();
  readonly error = this._error.asReadonly();

  // Called once when the app starts (provideAppInitializer in app.config.ts):
  // logs in again if the toggle was 'on' (the default) before the refresh.
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

  // Admin switch: log in again with the other account
  async setRole(role: RoleEnum): Promise<void> {
    this._role.set(role);
    this._save(ROLE_KEY, role);

    if (!this.isOn()) return; // logged out: just remember it for the next login

    await this._login();
    // A page with adminGuard must kick Alice out → run the guards of the current page again
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

  // The guards only run when you NAVIGATE. Navigate to the same URL on purpose:
  // with runGuardsAndResolvers: 'always' on the route, its guards run again (and may redirect).
  private async _rerunGuards(): Promise<void> {
    await this._router.navigateByUrl(this._router.url, { onSameUrlNavigation: 'reload' });
  }

  // localStorage can be missing or blocked (private mode...): never crash for it
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
  <!-- 1. logged in / logged out -->
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
      @if (toggle.busy()) {
        Logging in...
      } @else if (toggle.user(); as user) {
        Logged in as {{ user.name }}
        <span class="badge" [class]="toggle.isAdmin() ? 'text-bg-danger' : 'text-bg-secondary'">
          {{ user.role }}
        </span>
      } @else if (toggle.error()) {
        <span class="text-danger">Login failed</span>
      } @else {
        Logged out
      }
    </label>
  </div>

  <!-- 2. admin (Bob) / simple user (Alice). Only useful when logged in -->
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
    // Before the first page opens: log in again if the toggle is 'on'
    provideAppInitializer(() => inject(AuthToggleService).init()),
  ],
};
```
