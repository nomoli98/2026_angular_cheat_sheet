```ts match-field.validator.ts
import { SchemaPath, validate } from '@angular/forms/signals';

// valueOf = other field
export function matchField(path: SchemaPath<string>, other: SchemaPath<string>, message = "Passwords don't match") {
  validate(path, ({ value, valueOf }) => {
    if (!value()) return undefined; // empty: required's job
    return value() === valueOf(other) ? undefined : { kind: 'mismatch', message };
  });
}
```

```ts signal-validators.component.ts
crossModel = signal({ password: '', confirmPassword: '' });

crossForm = form(this.crossModel, (field) => {
  required(field.password, { message: 'Password is required' });
  required(field.confirmPassword, { message: 'Please confirm the password' });
  matchField(field.confirmPassword, field.password); // error on confirmPassword
});
```

```html signal-validators.component.html
@let confirm = crossForm.confirmPassword();
<input type="password" class="form-control" [formField]="crossForm.confirmPassword"
       [class.is-invalid]="confirm.touched() && confirm.invalid()" />

<!-- normal error block -->
@if (confirm.touched()) {
  @for (error of confirm.errors(); track error.kind) {
    <div class="invalid-feedback">{{ error.message }}</div>
  }
}
```
