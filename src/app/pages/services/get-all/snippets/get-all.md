```html get-all.component.html
<!-- explain why -->
@if (!_isAdmin()) {
<div class="alert alert-warning">Only an admin can do this.</div>
}

<!-- can't click -->
<button type="button" (click)="onClick()" [disabled]="!_isAdmin()">Get All Users</button>

<!-- 'unauthorized' / 'forbidden' / HTTP error -->
@if (_error(); as error) {
<div class="alert alert-danger">{{ error }}</div>
}

<!-- hide when not admin -->
@if (_isAdmin()) {
<ul>
  @for (u of _users(); track u.id) {
  <li>{{ u.name }}</li>
  }
</ul>
}
```

```ts get-all.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { UserResponse } from '@core/responses/user.response';
import { UserController } from '@core/controllers/user.controller';
import { AuthService } from '@core/services/auth.service';
import { isAdmin } from '@core/controllers/permissions';

@Component({
  selector: 'app-get-all',
  templateUrl: './get-all.component.html',
})
export class GetAllComponent {
  protected readonly _userController = inject(UserController);
  protected readonly _users = signal<UserResponse[]>([]);
  protected readonly _error = signal<string | null>(null);

  // re-runs on user change
  private readonly _authService = inject(AuthService);
  protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));

  async onClick() {
    this._error.set(null);

    // 1. component check
    if (!this._isAdmin()) {
      this._error.set('forbidden: only an admin can see the list of users');
      return;
    }

    try {
      // 2. controller checks again
      this._users.set(await this._userController.getAll());
    } catch (err) {
      // 'unauthorized' / 'forbidden' / HTTP
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
    const user = this._authService.currentUser(); // 1. who?
    if (!isAdmin(user)) deny(user); // 2. allowed?
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

  // UserEntity[] → UserResponse[]
  getAll(): Observable<UserResponse[]> {
    return this._http
      .get<UserEntity[]>(this._url)
      .pipe(map((users) => users.map((u) => this._mapper(u))));
  }
}
```
