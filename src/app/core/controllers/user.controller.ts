import { computed, inject, Service, signal } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { UserService } from '@core/services/user.service';
import { UserResponse } from '@core/responses/user.response';
import { RegisterRequest } from '@core/requests/register.request';
import { errorMessage } from '@core/controllers/error-message';

// Keeps the list of users in a signal and keeps it in sync after every create/update/delete,
// so the components never have to reload the list themselves.
@Service()
export class UserController {
  private readonly _userService = inject(UserService);

  // ── State (read-only outside) ─────────────────────────────
  private readonly _users = signal<UserResponse[]>([]);
  private readonly _selected = signal<UserResponse | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly users = this._users.asReadonly();
  readonly selected = this._selected.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly count = computed(() => this._users().length);

  // ── Read ──────────────────────────────────────────────────
  loadAll(): void {
    this._run(this._userService.getAll(), (users) => this._users.set(users));
  }

  loadOne(id: number): void {
    this._run(this._userService.getOne(id), (user) => this._selected.set(user));
  }

  // ── Write: update the list locally, no need to reload it ──
  create(request: RegisterRequest, onSuccess?: () => void): void {
    this._run(this._userService.create(request), (user) => {
      this._users.update((users) => [...users, user]); // add at the end
      onSuccess?.();
    });
  }

  updateFully(id: number, request: RegisterRequest, onSuccess?: () => void): void {
    this._run(this._userService.updateFully(id, request), (user) => {
      this._replace(user);
      onSuccess?.();
    });
  }

  updatePartial(id: number, changes: Partial<RegisterRequest>, onSuccess?: () => void): void {
    this._run(this._userService.updatePartial(id, changes), (user) => {
      this._replace(user);
      onSuccess?.();
    });
  }

  delete(id: number, onSuccess?: () => void): void {
    this._run(this._userService.delete(id), () => {
      this._users.update((users) => users.filter((u) => u.id !== id)); // remove it
      if (this._selected()?.id === id) this._selected.set(null);
      onSuccess?.();
    });
  }

  clearError(): void {
    this._error.set(null);
  }

  // ── Helpers ───────────────────────────────────────────────

  // The same 4 steps for every call: loading on, error off, subscribe, loading off.
  private _run<T>(request: Observable<T>, onSuccess: (value: T) => void): void {
    this._loading.set(true);
    this._error.set(null);
    request.pipe(finalize(() => this._loading.set(false))).subscribe({
      next: onSuccess,
      error: (err) => this._error.set(errorMessage(err)),
    });
  }

  // Puts the updated user in the list (and in `selected` if it's the same one).
  private _replace(user: UserResponse): void {
    this._users.update((users) => users.map((u) => (u.id === user.id ? user : u)));
    if (this._selected()?.id === user.id) this._selected.set(user);
  }
}
