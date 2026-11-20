```html get-me.component.html
<button type="button" (click)="onClick()">Get Me</button>

<!-- 'unauthorized' / HTTP error -->
@if (_error(); as error) {
<div class="alert alert-danger">{{ error }}</div>
}

@if (_me(); as u) {
<p>{{ u.name }} ({{ u.role }})</p>
}
```

```ts get-me.component.ts
import { Component, inject, signal } from '@angular/core';
import { UserResponse } from '@core/responses/user.response';
import { UserController } from '@core/controllers/user.controller';
import { errorMessage } from '@core/controllers/error-message';

@Component({
  selector: 'app-get-me',
  templateUrl: './get-me.component.html',
})
export class GetMeComponent {
  protected readonly _userController = inject(UserController);
  protected readonly _me = signal<UserResponse | null>(null);
  protected readonly _error = signal<string | null>(null);

  async onClick() {
    this._error.set(null);
    try {
      this._me.set(await this._userController.getMe()); // no id needed
    } catch (err) {
      this._error.set(errorMessage(err));
    }
  }
}
```

```ts user.controller.ts
// core/controllers/user.controller.ts
// anybody logged in
async getMe(): Promise<UserResponse> {
  const user = this._authService.currentUser(); // 1. who?
  if (!user) deny(user); // 2. nobody → 'unauthorized'
  // `never` → user not null
  return firstValueFrom(this._userService.getOne(user.id));
}
```

```ts user.service.ts
// core/services/user.service.ts
// just getOne(user.id)
getOne(id: number): Observable<UserResponse> {
  return this._http.get<UserEntity>(`${this._url}/${id}`).pipe(map((user) => this._mapper(user)));
}
```
