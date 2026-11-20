```html get-one.component.html
<!-- (submit) + preventDefault() = no page reload -->
<form (submit)="onSubmit($event)">
  <input type="number" [formField]="_idForm.id" />
  <button type="submit" [disabled]="_idForm().invalid()">Get One User</button>
</form>

<!-- 'unauthorized' / 'forbidden' / 'Not found' -->
@if (_error(); as error) {
<div class="alert alert-danger">{{ error }}</div>
}

<!-- `as u` = the value of the signal, only when it is not null -->
@if (_user(); as u) {
<p>{{ u.name }} ({{ u.email }})</p>
}
```

```ts get-one.component.ts
import { Component, inject, signal } from '@angular/core';
import { form, FormField, min, required } from '@angular/forms/signals';
import { UserResponse } from '@core/responses/user.response';
import { UserController } from '@core/controllers/user.controller';
import { errorMessage } from '@core/controllers/error-message';

@Component({
  imports: [FormField],
  selector: 'app-get-one',
  templateUrl: './get-one.component.html',
})
export class GetOneComponent {
  protected readonly _userController = inject(UserController);
  // null = nothing loaded yet (no need for a fake placeholder user)
  protected readonly _user = signal<UserResponse | null>(null);
  protected readonly _error = signal<string | null>(null);

  // a signal form with just one field: the id
  protected readonly _idForm = form(signal({ id: 2 }), (field) => {
    required(field.id, { message: 'Id is required' });
    min(field.id, 1, { message: 'Id starts at 1' });
  });

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this._idForm().invalid()) return;

    this._error.set(null);
    this._user.set(null);
    try {
      this._user.set(await this._userController.getOne(this._idForm.id().value()));
    } catch (err) {
      // errorMessage() turns an Error / HttpErrorResponse into readable text
      this._error.set(errorMessage(err));
    }
  }
}
```

```ts user.controller.ts
// core/controllers/user.controller.ts
// admin, or yourself
async getOne(id: number): Promise<UserResponse> {
  const user = this._authService.currentUser();
  if (!isAdminOrSelf(user, id)) deny(user); // 'unauthorized' / 'forbidden'
  return firstValueFrom(this._userService.getOne(id));
}
```

```ts user.service.ts
// core/services/user.service.ts
// GET /people/:id → UserEntity (with password) → UserResponse (without)
getOne(id: number): Observable<UserResponse> {
  return this._http.get<UserEntity>(`${this._url}/${id}`).pipe(map((user) => this._mapper(user)));
}
```
