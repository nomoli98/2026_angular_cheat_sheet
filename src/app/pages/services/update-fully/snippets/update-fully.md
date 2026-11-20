```html update-fully.component.html
<form (submit)="onSubmit($event)">
    <!-- which user -->
    <input type="number" [formField]="_form.id" />
    <button type="button" (click)="onLoad()" [disabled]="!_isAdmin()">Load current values</button>

    <!-- all fields (PUT) -->
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

    <button type="submit" [disabled]="_form().invalid() || !_isAdmin()">Update Fully</button>
</form>

@if (_error(); as error) {
<div class="alert alert-danger">{{ error }}</div>
} @if (_updated(); as u) {
<div class="alert alert-success">Saved: {{ u.name }}</div>
}
```

```ts update-fully.component.ts
// id + RegisterRequest
type UpdateFullyModel = { id: number } & RegisterRequest;

@Component({
    imports: [FormField],
    selector: 'app-update-fully',
    templateUrl: './update-fully.component.html',
})
export class UpdateFullyComponent {
    protected readonly _userController = inject(UserController);
    protected readonly _updated = signal<UserResponse | null>(null);
    protected readonly _error = signal<string | null>(null);

    // re-runs on user change
    private readonly _authService = inject(AuthService);
    protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));

    protected readonly _model = signal<UpdateFullyModel>({
        id: 2,
        name: '',
        email: '',
        password: '',
        birthdate: '',
        height: 170,
        gender: GenderEnum.OTHER,
        subscription: 'free',
        agreeToTerms: true,
    });

    // PUT: all required
    protected readonly _form = form(this._model, (field) => {
        min(field.id, 1, { message: 'Id starts at 1' });
        required(field.name, { message: 'Name is required' });
        email(field.email, { message: 'Email must be a valid email' });
        strongPassword(field.password);
        birthdate(field.birthdate, { minAge: 18, maxAge: 120 });
        // ...same rules as the register form
    });

    // fill: set() the model
    async onLoad() {
        // 1. component check
        if (!this._isAdmin()) {
            this._error.set('forbidden: only an admin can read a user');
            return;
        }
        const { id, name, email, birthdate, height, gender, subscription } =
            await this._userController.getOne(this._form.id().value());
        this._model.set({
            id,
            name,
            email,
            birthdate,
            height,
            gender,
            subscription,
            password: '', // never sent back
            agreeToTerms: true,
        });
    }

    async onSubmit(event: Event) {
        event.preventDefault();
        if (this._form().invalid()) return;
        // 1. component check
        if (!this._isAdmin()) {
            this._error.set('forbidden: only an admin can update a user');
            return;
        }

        // take `id` out
        const { id, ...request } = this._form().value();
        try {
            this._updated.set(await this._userController.updateFully(id, request));
        } catch (err) {
            this._error.set(errorMessage(err));
        }
    }
}
```

```ts user.controller.ts
// core/controllers/user.controller.ts
// admin only
async updateFully(id: number, request: RegisterRequest): Promise<UserResponse> {
  const user = this._authService.currentUser();
  if (!isAdmin(user)) deny(user);
  return firstValueFrom(this._userService.updateFully(id, request));
}
```

```ts user.service.ts
// core/services/user.service.ts
// PUT: keep the current role
updateFully(id: number, request: RegisterRequest): Observable<UserResponse> {
  return this._http.get<UserEntity[]>(this._url, { params: { id } }).pipe(
    switchMap(([current]) =>
      current
        ? this._http.put<UserEntity>(`${this._url}/${id}`, { ...request, role: current.role })
        : throwError(() => new Error('user not found')),
    ),
    map((user) => this._mapper(user)),
  );
}
```
