```html update.component.html
<form (submit)="onSubmit($event)">
  <input type="number" [formField]="_form.id" />

  <!-- empty = don't change it -->
  <input type="text" [formField]="_form.name" />
  <input type="email" [formField]="_form.email" />
  <input type="number" [formField]="_form.height" /> <!-- empty → null -->
  <select [formField]="_form.gender">
    <option value="">(don't change)</option>
    ...
  </select>

  <button type="submit" [disabled]="_form().invalid()">Update</button>
</form>
```

```ts update.component.ts
// Every field can be EMPTY ('' or null) = "don't change it"
interface UpdateModel {
  id: number;
  name: string;
  email: string;
  password: string;
  birthdate: string;
  height: number | null; // an empty <input type="number"> gives null
  gender: GenderEnum | '';
  subscription: 'free' | 'premium' | '';
}

export class UpdateComponent {
  protected readonly _model = signal<UpdateModel>({
    id: 2, name: '', email: '', password: '', birthdate: '', height: null, gender: '', subscription: '',
  });

  // Only the id is required. The other rules only matter when the field is filled in.
  protected readonly _form = form(this._model, (field) => {
    required(field.id);
    email(field.email); // '' is OK for email()
    // strongPassword() would complain about '' → applyWhen = only when something is typed
    applyWhen(field.password, ({ value }) => value() !== '', (password) => strongPassword(password));
    min(field.height, 50); // min/max skip null
  });

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this._form().invalid()) return;

    const { id, ...fields } = this._form().value();
    // Keep only the fields that were filled in
    const changes = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== '' && value !== null),
    ) as Partial<RegisterRequest>;
    // e.g. { height: 170 } → PATCH /people/2 with { "height": 170 }

    try {
      this._updated.set(await this._userController.updatePartial(id, changes));
    } catch (err) {
      this._error.set(errorMessage(err));
    }
  }
}
```

```ts user.controller.ts
// core/controllers/user.controller.ts
// admin, or yourself
async updatePartial(id: number, changes: Partial<RegisterRequest>): Promise<UserResponse> {
  const user = this._authService.currentUser();
  if (!isAdminOrSelf(user, id)) deny(user);
  return firstValueFrom(this._userService.updatePartial(id, changes));
}
```

```ts user.service.ts
// core/services/user.service.ts
// PATCH only sends the changes: the other fields (and the role) stay as they are
updatePartial(id: number, request: Partial<RegisterRequest>): Observable<UserResponse> {
  return this.ifExists(id, () =>
    this._http
      .patch<UserEntity>(`${this._url}/${id}`, request)
      .pipe(map((user) => this._mapper(user))),
  );
}
```
