```html get-all.component.html
<button type="button" (click)="onClick()">Get All Users</button>

<!-- 'unauthorized' / 'forbidden' / HTTP error -->
@if (_error(); as error) {
<div class="alert alert-danger">{{ error }}</div>
}

<ul>
  @for (u of _users(); track u.id) {
  <li>{{ u.name }}</li>
  }
</ul>
```

```ts get-all.component.ts
import { Component, inject, signal } from '@angular/core';
import { UserResponse } from '@core/responses/user.response';
import { UserController } from '@core/controllers/user.controller';

@Component({
  selector: 'app-get-all',
  templateUrl: './get-all.component.html',
})
export class GetAllComponent {
  protected readonly _userController = inject(UserController);
  protected readonly _users = signal<UserResponse[]>([]);
  protected readonly _error = signal<string | null>(null);

  async onClick() {
    this._error.set(null);
    try {
      // the controller returns a Promise → await it
      this._users.set(await this._userController.getAll());
    } catch (err) {
      // 'unauthorized' (nobody logged in), 'forbidden' (not admin) or an HTTP error
      this._error.set((err as Error).message);
    }
  }
}
```

```ts user.controller.ts
// core/controllers/user.controller.ts
@Service()
export class UserController {
  private readonly _userService = inject(UserService);
  private readonly _authService = inject(AuthService);

  // admin only
  async getAll(): Promise<UserResponse[]> {
    const user = this._authService.currentUser(); // 1. who is asking?
    if (!isAdmin(user)) deny(user); // 2. not allowed → throw 'unauthorized' / 'forbidden'
    return firstValueFrom(this._userService.getAll()); // 3. Observable → Promise
  }
}
```

```ts user.service.ts
// core/services/user.service.ts
@Service()
export class UserService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.apiUrl}/people`;
  private readonly _mapper = UserMapper;

  // GET /people → UserEntity[] (with passwords) → UserResponse[] (without)
  getAll(): Observable<UserResponse[]> {
    return this._http
      .get<UserEntity[]>(this._url)
      .pipe(map((users) => users.map((u) => this._mapper(u))));
  }
}
```
