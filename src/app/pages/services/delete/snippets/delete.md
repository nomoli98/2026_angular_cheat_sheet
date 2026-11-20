```html delete.component.html
<form (submit)="onSubmit($event)">
    <input type="number" [formField]="_idForm.id" />
    <button type="submit" [disabled]="_idForm().invalid() || !_isAdmin()">Delete User</button>
</form>

<!-- confirm: a signal -->
@if (_confirming()) {
<p>Really delete user #{{ _idForm.id().value() }}?</p>
<button type="button" (click)="onConfirm()">Yes, delete</button>
<button type="button" (click)="_confirming.set(false)">Cancel</button>
} @if (_deletedId(); as id) {
<div class="alert alert-success">User #{{ id }} deleted</div>
}
```

```ts delete.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, min, required } from '@angular/forms/signals';
import { UserController } from '@core/controllers/user.controller';
import { errorMessage } from '@core/controllers/error-message';
import { AuthService } from '@core/services/auth.service';
import { isAdmin } from '@core/controllers/permissions';

@Component({
    imports: [FormField],
    selector: 'app-delete',
    templateUrl: './delete.component.html',
})
export class DeleteComponent {
    protected readonly _userController = inject(UserController);
    protected readonly _confirming = signal(false); // 1st asks, 2nd deletes
    protected readonly _deletedId = signal<number | null>(null);
    protected readonly _error = signal<string | null>(null);

    // re-runs on user change
    private readonly _authService = inject(AuthService);
    protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));

    protected readonly _idForm = form(signal({ id: 2 }), (field) => {
        required(field.id);
        min(field.id, 1);
    });

    onSubmit(event: Event) {
        event.preventDefault();
        if (this._idForm().invalid()) return;
        // 1. component check
        if (!this._isAdmin()) {
            this._error.set('forbidden: only an admin can delete a user');
            return;
        }
        this._confirming.set(true);
    }

    async onConfirm() {
        const id = this._idForm.id().value();
        this._confirming.set(false);
        // re-check (toggle)
        if (!this._isAdmin()) {
            this._error.set('forbidden: only an admin can delete a user');
            return;
        }
        try {
            // 2. controller checks again
            await this._userController.delete(id); // Promise<void>
            this._deletedId.set(id);
        } catch (err) {
            this._error.set(errorMessage(err));
        }
    }
}
```

```ts user.controller.ts
// core/controllers/user.controller.ts
// admin only
async delete(id: number): Promise<void> {
  const user = this._authService.currentUser();
  if (!isAdmin(user)) deny(user);
  // no EmptyError
  await firstValueFrom(this._userService.delete(id), { defaultValue: undefined });
}
```

```ts user.service.ts
// core/services/user.service.ts
// 'user not found', not 404
delete(id: number): Observable<void> {
  return this.ifExists(id, () => this._http.delete<void>(`${this._url}/${id}`));
}
```
