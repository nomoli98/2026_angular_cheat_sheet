```html login.component.html
<!-- WHO is logged in: just read the signal -->
@if (_currentUser(); as user) {
<p>Logged in as {{ user.name }} ({{ user.role }})</p>
<button type="button" (click)="onLogout()">Log out</button>
} @else {
<p>Nobody is logged in.</p>
}

<form (submit)="onSubmit($event)">
  <input type="email" [formField]="_form.email" />
  <input type="password" [formField]="_form.password" />
  <button type="submit" [disabled]="_form().invalid() || _busy()">Log in</button>
</form>

<!-- 'Wrong email or password' -->
@if (_error(); as error) {
<div class="alert alert-danger">{{ error }}</div>
}
```

```ts login.component.ts
@Component({
  imports: [FormField],
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  protected readonly _authController = inject(AuthController);
  // read-only: WHO is logged in (the controller does the login/logout)
  protected readonly _currentUser = inject(AuthService).currentUser;
  protected readonly _error = signal<string | null>(null);
  protected readonly _busy = signal(false);

  protected readonly _model = signal<LoginRequest>({ email: '', password: '' });
  // no strongPassword() on login: only check it's filled, the API says if it's right
  protected readonly _form = form(this._model, (field) => {
    required(field.email);
    email(field.email);
    required(field.password);
  });

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this._form().invalid()) return;

    this._busy.set(true);
    try {
      await this._authController.login(this._form().value()); // fills currentUser
    } catch (err) {
      this._error.set(errorMessage(err)); // 'bad credentials' → 'Wrong email or password'
    } finally {
      this._busy.set(false);
    }
  }

  async onLogout() {
    await this._authController.logout(); // empties currentUser
  }
}
```

```ts auth.controller.ts
// core/controllers/auth.controller.ts
// public
async login(request: LoginRequest): Promise<UserResponse> {
  return firstValueFrom(this._authService.login(request));
}

// logged in only
async logout(): Promise<void> {
  const user = this._authService.currentUser();
  if (!isLoggedIn(user)) deny(user); // nobody → 'unauthorized'
  this._authService.logout();
}
```

```ts auth.service.ts
// core/services/auth.service.ts
private readonly _currentUser = signal<UserResponse | null>(null);
readonly currentUser = this._currentUser.asReadonly(); // others can READ, not set

login(request: LoginRequest): Observable<UserResponse> {
  return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
    map((users) => {
      const user = users[0];
      // same error for "unknown email" and "wrong password": don't tell which one
      if (!user || user.password !== request.password) throw new Error('bad credentials');
      return UserMapper(user); // removes the password
    }),
    tap((user) => this._currentUser.set(user)), // remember who is logged in
  );
}

logout(): void {
  this._currentUser.set(null);
}
```
