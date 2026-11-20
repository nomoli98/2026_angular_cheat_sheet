```html register.component.html
<form (submit)="onSubmit($event)">
  <input type="text" [formField]="_form.name" />
  <input type="email" [formField]="_form.email" />
  <input type="password" [formField]="_form.password" />
  <input type="date" [formField]="_form.birthdate" />
  <input type="number" [formField]="_form.height" />
  <select [formField]="_form.gender">...</select>
  <select [formField]="_form.subscription">...</select>
  <input type="checkbox" [formField]="_form.agreeToTerms" />

  <!-- disabled while invalid OR while waiting for the API (no double submit) -->
  <button type="submit" [disabled]="_form().invalid() || _busy()">Register</button>
</form>

<!-- 'This email is already taken' / HTTP error -->
@if (_error(); as error) {
<div class="alert alert-danger">{{ error }}</div>
}

@if (_created(); as u) {
<div class="alert alert-success">Welcome, {{ u.name }}! You are logged in.</div>
}
```

```ts register.component.ts
const EMPTY: RegisterRequest = {
  name: '', email: '', password: '', birthdate: '',
  height: 170, gender: GenderEnum.OTHER, subscription: 'free', agreeToTerms: false,
};

@Component({
  imports: [FormField],
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  protected readonly _authController = inject(AuthController);
  protected readonly _created = signal<UserResponse | null>(null);
  protected readonly _error = signal<string | null>(null);
  protected readonly _busy = signal(false);

  protected readonly _model = signal<RegisterRequest>({ ...EMPTY });
  protected readonly _form = form(this._model, (field) => {
    required(field.name, { message: 'Name is required' });
    email(field.email, { message: 'Email must be a valid email' });
    strongPassword(field.password);
    birthdate(field.birthdate, { minAge: 18, maxAge: 120 });
    // ...same rules as the Signal Forms page
  });

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this._form().invalid()) return;

    this._error.set(null);
    this._busy.set(true);
    try {
      this._created.set(await this._authController.register(this._form().value()));
      this._model.set({ ...EMPTY }); // empty the fields
      this._form().reset(); // back to "untouched": no red fields
    } catch (err) {
      this._error.set(errorMessage(err));
    } finally {
      this._busy.set(false); // runs on success AND on error
    }
  }
}
```

```ts auth.controller.ts
// core/controllers/auth.controller.ts
// public: no permission check
async register(request: RegisterRequest): Promise<UserResponse> {
  return firstValueFrom(this._authService.register(request));
}
```

```ts auth.service.ts
// core/services/auth.service.ts
register(request: RegisterRequest): Observable<UserResponse> {
  return this._userService.emailExists(request.email).pipe(
    // 1. email taken → error, nothing is created
    // 2. free → POST /people (UserService.create always sets role: 'user')
    switchMap((taken) =>
      taken
        ? throwError(() => new Error('email already taken'))
        : this._userService.create(request),
    ),
    // 3. remember the new user: they are logged in
    tap((user) => this._currentUser.set(user)),
  );
}
```
