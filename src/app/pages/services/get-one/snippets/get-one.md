```html get-one.component.html
<!-- no page reload -->
<form (submit)="onSubmit($event)">
    <input type="number" [formField]="_idForm.id" />
    <!-- disabled for users -->
    <button type="submit" [disabled]="_idForm().invalid() || !_isAdmin()">Get One User</button>
</form>

<!-- 'unauthorized' / 'forbidden' / 'Not found' -->
@if (_error(); as error) {
<div class="alert alert-danger">{{ error }}</div>
}

<!-- `as u`: when not null -->
@if (_isAdmin() && _user(); as u) {
<p>{{ u.name }} ({{ u.email }})</p>
}
```

```ts get-one.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, min, required } from '@angular/forms/signals';
import { UserResponse } from '@core/responses/user.response';
import { UserController } from '@core/controllers/user.controller';
import { errorMessage } from '@core/controllers/error-message';
import { AuthService } from '@core/services/auth.service';
import { isAdmin } from '@core/controllers/permissions';

@Component({
    imports: [FormField],
    selector: 'app-get-one',
    templateUrl: './get-one.component.html',
})
export class GetOneComponent {
    protected readonly _userController = inject(UserController);
    // null = not loaded
    protected readonly _user = signal<UserResponse | null>(null);
    protected readonly _error = signal<string | null>(null);

    // re-runs on user change
    private readonly _authService = inject(AuthService);
    protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));

    // id-only signal form
    protected readonly _idForm = form(signal({ id: 2 }), (field) => {
        required(field.id, { message: 'Id is required' });
        min(field.id, 1, { message: 'Id starts at 1' });
    });

    async onSubmit(event: Event) {
        event.preventDefault();
        if (this._idForm().invalid()) return;

        this._error.set(null);
        this._user.set(null);
        // 1. component check
        if (!this._isAdmin()) {
            this._error.set('forbidden: only an admin can read a user');
            return;
        }

        try {
            // 2. controller checks again
            this._user.set(await this._userController.getOne(this._idForm.id().value()));
        } catch (err) {
            // error → readable text
            this._error.set(errorMessage(err));
        }
    }
}
```

```ts user.controller.ts
// core/controllers/user.controller.ts
// admin only
async getOne(id: number): Promise<UserResponse> {
  const user = this._authService.currentUser();
  if (!isAdmin(user)) deny(user); // 'unauthorized' / 'forbidden'
  return firstValueFrom(this._userService.getOne(id));
}
```

```ts user.service.ts
// core/services/user.service.ts
// UserEntity → UserResponse
getOne(id: number): Observable<UserResponse> {
  return this._http.get<UserEntity>(`${this._url}/${id}`).pipe(map((user) => this._mapper(user)));
}
```
