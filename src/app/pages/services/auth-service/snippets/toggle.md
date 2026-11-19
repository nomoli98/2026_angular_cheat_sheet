```ts auth-toggle.service.ts
import { computed, inject, Service, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { LoginRequest } from '@core/requests/login.request';

// The demo account the toggle logs in with (an admin, see db.seed.json)
const BOB: LoginRequest = { email: 'bob@email.bob', password: 'BobIsTheBest99#' };
const STORAGE_KEY = 'auth-toggle'; // 'on' | 'off' in localStorage

// Drives the "logged in" switch in the navbar, like a theme toggle:
// - on  → real login as Bob through the API (AuthService.login)
// - off → logout, and the guard sends you to the auth page
// The choice is saved in localStorage, so it survives a refresh.
@Service()
export class AuthToggleService {
  private readonly _auth = inject(AuthService);
  private readonly _router = inject(Router);

  private readonly _busy = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly user = this._auth.currentUser;
  readonly isOn = computed(() => this._auth.currentUser() !== null);
  readonly busy = this._busy.asReadonly();
  readonly error = this._error.asReadonly();

  // Called once when the app starts (provideAppInitializer in app.config.ts):
  // logs in again if the toggle was 'on' (the default) before the refresh.
  async init(): Promise<void> {
    if (this._read() !== 'off') await this._login();
  }

  async set(on: boolean): Promise<void> {
    this._save(on ? 'on' : 'off');

    if (on) {
      await this._login();
      return;
    }

    this._auth.logout();
    // Run the guards of the current page again: if it's protected, the guard redirects.
    await this._router.navigateByUrl(this._router.url, { onSameUrlNavigation: 'reload' });
  }

  private async _login(): Promise<void> {
    this._busy.set(true);
    this._error.set(null);
    try {
      await firstValueFrom(this._auth.login(BOB));
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

  // localStorage can be missing or blocked (private mode...): never crash for it
  private _read(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private _save(value: 'on' | 'off'): void {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
  }
}
```

```html auth-toggle.component.html
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
      Logged in as {{ user.name }} ({{ user.role }})
    } @else if (toggle.error()) {
      <span class="text-danger">Login failed</span>
    } @else {
      Logged out
    }
  </label>
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
