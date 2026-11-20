```html get-all.component.html
<!-- tell a simple user why the button does nothing -->
@if (!_isAdmin()) {
<div class="alert alert-warning">Only an admin can do this.</div>
}

<!-- [disabled]: a simple user can't even click -->
<button type="button" (click)="onClick()" [disabled]="!_isAdmin()">Get All Users</button>

<!-- 'unauthorized' / 'forbidden' / HTTP error -->
@if (_error(); as error) {
<div class="alert alert-danger">{{ error }}</div>
}

<!-- hide the data if the user stops being admin (logout, toggle...) -->
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

  // Who is logged in, and are they admin? Re-computed when the user changes (navbar toggle)
  private readonly _authService = inject(AuthService);
  protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));

  async onClick() {
    this._error.set(null);

    // 1. Check in the component: not admin → don't even call the controller
    if (!this._isAdmin()) {
      this._error.set('forbidden: only an admin can see the list of users');
      return;
    }

    try {
      // 2. The controller checks AGAIN (can't be skipped), then calls the service.
      //    It returns a Promise → await it
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
