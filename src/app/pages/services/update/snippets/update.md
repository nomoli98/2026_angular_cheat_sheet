```html update.component.html
<form (submit)="onSubmit($event)">
    <input type="number" [formField]="_form.id" />

    <!-- empty = don't change it -->
    <input type="text" [formField]="_form.name" />
    <input type="email" [formField]="_form.email" />
    <input type="number" [formField]="_form.height" />
    <!-- empty → null -->
    <select [formField]="_form.gender">
        <option value="">(don't change)</option>
        ...
    </select>

    <button type="submit" [disabled]="_form().invalid() || !_isAdmin()">Update</button>
</form>
```

```ts update.component.ts
// empty = don't change it
interface UpdateModel {
    id: number;
    name: string;
    email: string;
    password: string;
    birthdate: string;
    height: number | null; // empty → null
    gender: GenderEnum | '';
    subscription: 'free' | 'premium' | '';
}

export class UpdateComponent {
    // re-runs on user change
    private readonly _authService = inject(AuthService);
    protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));

    protected readonly _model = signal<UpdateModel>({
        id: 2,
        name: '',
        email: '',
        password: '',
        birthdate: '',
        height: null,
        gender: '',
        subscription: '',
    });

    // only id required
    protected readonly _form = form(this._model, (field) => {
        required(field.id);
        email(field.email); // '' is OK
        // only when typed
        applyWhen(
            field.password,
            ({ value }) => value() !== '',
            (password) => strongPassword(password),
        );
        min(field.height, 50); // skips null
    });

    async onSubmit(event: Event) {
        event.preventDefault();
        if (this._form().invalid()) return;
        // 1. component check
        if (!this._isAdmin()) {
            this._error.set('forbidden: only an admin can update a user');
            return;
        }

        const { id, ...fields } = this._form().value();
        // filled fields only
        const changes = Object.fromEntries(
            Object.entries(fields).filter(([, value]) => value !== '' && value !== null),
        ) as Partial<RegisterRequest>;
        // { height: 170 } → PATCH

        try {
            // 2. controller checks again
            this._updated.set(await this._userController.updatePartial(id, changes));
        } catch (err) {
            this._error.set(errorMessage(err));
        }
    }
}
```

```ts user.controller.ts
// core/controllers/user.controller.ts
// admin only
async updatePartial(id: number, changes: Partial<RegisterRequest>): Promise<UserResponse> {
  const user = this._authService.currentUser();
  if (!isAdmin(user)) deny(user);
  return firstValueFrom(this._userService.updatePartial(id, changes));
}
```

```ts user.service.ts
// core/services/user.service.ts
// PATCH: role untouched
updatePartial(id: number, request: Partial<RegisterRequest>): Observable<UserResponse> {
  return this.ifExists(id, () =>
    this._http
      .patch<UserEntity>(`${this._url}/${id}`, request)
      .pipe(map((user) => this._mapper(user))),
  );
}
```
