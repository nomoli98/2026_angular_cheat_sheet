```ts email-taken.validator.ts
import { SchemaPath, validateHttp } from '@angular/forms/signals';
import { UserEntity } from '@core/entities/user.entity';
import { environment } from '@env/environment';

// Async: GET /people?email=...
export function emailTaken(path: SchemaPath<string>) {
  validateHttp(path, {
    // undefined = skip
    request: ({ value }) =>
      value() ? { url: `${environment.apiUrl}/people`, params: { email: value() } } : undefined,
    onSuccess: (users: UserEntity[]) =>
      users.length > 0 ? { kind: 'emailTaken', message: 'This email is already taken' } : undefined,
    onError: () => ({ kind: 'serverError', message: 'Could not check the email' }),
    debounce: 400, // request only
  });
}
```

```ts signal-validators.component.ts
asyncModel = signal({ email: '' });

asyncForm = form(this.asyncModel, (field) => {
  required(field.email, { message: 'Email is required' });
  email(field.email, { message: 'Not a valid email' });
  emailTaken(field.email); // runs after sync rules
});
```

```html signal-validators.component.html
@let mail = asyncForm.email();
<input type="email" class="form-control" [formField]="asyncForm.email"
       [class.is-invalid]="mail.touched() && mail.invalid()" />

<!-- while waiting -->
@if (mail.pending()) { <div class="form-text">Checking the email...</div> }

@if (mail.touched()) {
  @for (error of mail.errors(); track error.kind) {
    <div class="invalid-feedback">{{ error.message }}</div>
  }
}
```

