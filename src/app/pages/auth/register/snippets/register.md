```html register.component.html
<form (submit)="onSubmit($event)">
    <input type="text" [formField]="_form.name" />
    <input type="email" [formField]="_form.email" />
    <input type="password" [formField]="_form.password" />
    <input type="date" [formField]="_form.birthdate" />
    <input type="number" [formField]="_form.height" />
    <select [formField]="_form.gender">
        ...
    </select>
    <select [formField]="_form.subscription">
        ...
    </select>
    <input type="checkbox" [formField]="_form.agreeToTerms" />

    <!-- no double submit -->
    <button type="submit" [disabled]="_form().invalid() || _busy()">Register</button>
</form>

<!-- 'email already taken' / HTTP error -->
@if (_error(); as error) {
<div class="alert alert-danger">{{ error }}</div>
} @if (_created(); as u) {
<div class="alert alert-success">Welcome, {{ u.name }}! You are logged in.</div>
}
```

```ts register.component.ts
const EMPTY: RegisterRequest = {
    name: '',
    email: '',
    password: '',
    birthdate: '',
    height: 170,
    gender: GenderEnum.OTHER,
    subscription: 'free',
    agreeToTerms: false,
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
        // ...signal form rules
    });

    async onSubmit(event: Event) {
        event.preventDefault();
        if (this._form().invalid()) return;

        this._error.set(null);
        this._busy.set(true);
        try {
            this._created.set(await this._authController.register(this._form().value()));
            this._model.set({ ...EMPTY }); // clear
            this._form().reset(); // no red fields
        } catch (err) {
            this._error.set(errorMessage(err));
        } finally {
            this._busy.set(false); // success AND error
        }
    }
}
```

```ts auth.controller.ts
// core/controllers/auth.controller.ts
// public
async register(request: RegisterRequest): Promise<UserResponse> {
  return firstValueFrom(this._authService.register(request));
}
```

```ts auth.service.ts
// core/services/auth.service.ts
register(request: RegisterRequest): Observable<UserResponse> {
  return this._userService.emailExists(request.email).pipe(
    // email taken → error, else POST (role: user)
    switchMap((taken) =>
      taken
        ? throwError(() => new Error('email already taken'))
        : this._userService.create(request),
    ),
    // logged in
    tap((user) => this._currentUser.set(user)),
  );
}
```
