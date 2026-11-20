```html delete.component.html
<form (submit)="onSubmit($event)">
  <input type="number" [formField]="_idForm.id" />
  <button type="submit" [disabled]="_idForm().invalid()">Delete User</button>
</form>

<!-- ask before deleting: a simple signal, no browser confirm() -->
@if (_confirming()) {
<p>Really delete user #{{ _idForm.id().value() }}?</p>
<button type="button" (click)="onConfirm()">Yes, delete</button>
<button type="button" (click)="_confirming.set(false)">Cancel</button>
}

@if (_deletedId(); as id) {
<div class="alert alert-success">User #{{ id }} deleted</div>
}
```

```ts delete.component.ts
import { Component, inject, signal } from '@angular/core';
import { form, FormField, min, required } from '@angular/forms/signals';
import { UserController } from '@core/controllers/user.controller';
import { errorMessage } from '@core/controllers/error-message';

@Component({
  imports: [FormField],
  selector: 'app-delete',
  templateUrl: './delete.component.html',
})
export class DeleteComponent {
  protected readonly _userController = inject(UserController);
  protected readonly _confirming = signal(false); // first click asks, second click deletes
  protected readonly _deletedId = signal<number | null>(null);
  protected readonly _error = signal<string | null>(null);

  protected readonly _idForm = form(signal({ id: 2 }), (field) => {
    required(field.id);
    min(field.id, 1);
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (this._idForm().invalid()) return;
    this._confirming.set(true);
  }

  async onConfirm() {
    const id = this._idForm.id().value();
    this._confirming.set(false);
    try {
      await this._userController.delete(id); // Promise<void>: nothing to read, just wait
      this._deletedId.set(id);
    } catch (err) {
      this._error.set(errorMessage(err));
    }
  }
}
```

```ts user.controller.ts
// core/controllers/user.controller.ts
// admin, or yourself
async delete(id: number): Promise<void> {
  const user = this._authService.currentUser();
  if (!isAdminOrSelf(user, id)) deny(user);
  // defaultValue: no error if the Observable ends without a value
  await firstValueFrom(this._userService.delete(id), { defaultValue: undefined });
}
```

```ts user.service.ts
// core/services/user.service.ts
// check first: json-server answers 404 for a missing id, we want 'user not found'
delete(id: number): Observable<void> {
  return this.ifExists(id, () => this._http.delete<void>(`${this._url}/${id}`));
}
```
