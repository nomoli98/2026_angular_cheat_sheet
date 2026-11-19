import { computed, inject, Service, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { LoginRequest } from '@core/requests/login.request';
import { RegisterRequest } from '@core/requests/register.request';
import { errorMessage } from '@core/controllers/error-message';

// Controller = the layer between components and services.
// - the SERVICE talks HTTP and returns Observables
// - the CONTROLLER subscribes, and keeps the result in SIGNALS (data, loading, error)
// - the COMPONENT only reads signals and calls methods: no Observable, no subscribe
@Service()
export class AuthController {
  private readonly _authService = inject(AuthService);

  // ── State (read-only outside) ─────────────────────────────
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly currentUser = this._authService.currentUser; // already a read-only signal
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // ── Actions ───────────────────────────────────────────────
  login(request: LoginRequest, onSuccess?: () => void): void {
    this._start();
    this._authService
      .login(request)
      .pipe(finalize(() => this._loading.set(false))) // success OR error → loading off
      .subscribe({
        next: () => onSuccess?.(),
        error: (err) => this._error.set(errorMessage(err)),
      });
  }

  register(request: RegisterRequest, onSuccess?: () => void): void {
    this._start();
    this._authService
      .register(request)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: () => onSuccess?.(),
        error: (err) => this._error.set(errorMessage(err)),
      });
  }

  logout(): void {
    this._authService.logout();
    this._error.set(null);
  }

  clearError(): void {
    this._error.set(null);
  }

  private _start(): void {
    this._loading.set(true);
    this._error.set(null);
  }
}
