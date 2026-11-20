import { computed, inject, Service, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { LoginRequest } from '@core/requests/login.request';
import { RoleEnum } from '@core/enums/role.enum';
import { isAdmin } from '@core/controllers/permissions';

// demo accounts (db.seed.json)
const ACCOUNTS: Record<RoleEnum, LoginRequest> = {
    [RoleEnum.ADMIN]: { email: 'bob@email.bob', password: 'BobIsTheBest99#' }, // admin
    [RoleEnum.USER]: { email: 'alice.dupont@mail.com', password: 'AliceIsTheBest99#' }, // user
};
const STORAGE_KEY = 'auth-toggle'; // 'on' | 'off' in localStorage
const ROLE_KEY = 'auth-role'; // 'admin' | 'user' in localStorage

// the 2 navbar switches: a real login (Bob or Alice), saved in localStorage
@Service()
export class AuthToggleService {
    private readonly _auth = inject(AuthService);
    private readonly _router = inject(Router);

    private readonly _busy = signal(false);
    private readonly _error = signal<string | null>(null);
    // account used (default: admin)
    private readonly _role = signal<RoleEnum>(
        this._read(ROLE_KEY) === RoleEnum.USER ? RoleEnum.USER : RoleEnum.ADMIN,
    );

    readonly user = this._auth.currentUser;
    readonly isOn = computed(() => this._auth.currentUser() !== null);
    // the role from the API, not the switch
    readonly isAdmin = computed(() => isAdmin(this._auth.currentUser()));
    readonly role = this._role.asReadonly();
    readonly busy = this._busy.asReadonly();
    readonly error = this._error.asReadonly();

    // app start: log in again if the toggle was on
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

    // admin switch: log in with the other account
    async setRole(role: RoleEnum): Promise<void> {
        this._role.set(role);
        this._save(ROLE_KEY, role);

        if (!this.isOn()) return; // logged out: remember for later

        await this._login();
        // re-run the guards (adminGuard kicks Alice out)
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

    // same-URL navigation re-runs the guards (runGuardsAndResolvers: 'always')
    private async _rerunGuards(): Promise<void> {
        await this._router.navigateByUrl(this._router.url, { onSameUrlNavigation: 'reload' });
    }

    // localStorage may be blocked: never crash
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
