# Validators in Signal Forms

> 📖 **Official docs:** [Signal Forms validation](https://angular.dev/guide/forms/signals/validation) · [Async operations](https://angular.dev/guide/forms/signals/async-operations)

How to validate a **Signal Form** (`form()` + schema): every rule is one line in the schema function, and each error carries its **message**.
Live demo: **`/form/signal-validators`**. The full register form is in [`../signal-form/SIGNAL_FORM.md`](../signal-form/SIGNAL_FORM.md).

```
src/app/core/validators/signal-form/
├── strong-password.validator.ts   ← strongPassword(path)
├── birthdate.validator.ts         ← birthdate(path, { minAge, maxAge })
├── match-field.validator.ts       ← matchField(path, otherPath)
└── email-taken.validator.ts       ← emailTaken(path), async
```

- Each field is a function that returns its state: `form.email()` → `.value()`, `.errors()`, `.touched()`, `.invalid()`, `.pending()`.
- An error is `{ kind: 'xxx', message: '...' }`: the template just shows `error.message`.
- A rule returns `undefined` (valid), **one** error, or an **array** of errors.

---

## 1. Built-in rules

```ts signal-validators.component.ts
import { signal } from '@angular/core';
import { form, FormField, required, minLength, maxLength, min, max } from '@angular/forms/signals';

@Component({
  imports: [FormField], // required import
  ...
})
export class SignalValidatorsComponent {
  // the model
  builtInModel = signal({ name: '', height: 50, agreeToTerms: false });

  // the schema
  builtInForm = form(this.builtInModel, (field) => {
    required(field.name, { message: 'Name is required' });
    minLength(field.name, 2, { message: 'At least 2 characters' });
    maxLength(field.name, 50, { message: 'At most 50 characters' });

    min(field.height, 50, { message: 'Minimum 50 cm' });
    max(field.height, 275, { message: 'Maximum 275 cm' });

    required(field.agreeToTerms, { message: 'You must accept the terms' }); // false = empty
  });
}
```

```html signal-validators.component.html
@let name = builtInForm.name();
<input
    class="form-control"
    [formField]="builtInForm.name"
    [class.is-invalid]="name.touched() && name.invalid()"
/>

<!-- same block everywhere -->
@if (name.touched()) { @for (error of name.errors(); track error.kind) {
<div class="invalid-feedback">{{ error.message }}</div>
} }

<input type="number" class="form-control" [formField]="builtInForm.height" />
<input type="checkbox" class="form-check-input" [formField]="builtInForm.agreeToTerms" />
```

| Rule                             | Example                                 | Notes                                                                                                    |
| -------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `required`                       | `required(field.name)`                  | empty = `null`, `undefined`, `''`, `false`, `NaN`. An **empty array counts as filled** → use `minLength` |
| `email`                          | `email(field.email)`                    |                                                                                                          |
| `minLength` / `maxLength`        | `minLength(field.name, 2)`              | strings **and** arrays                                                                                   |
| `min` / `max`                    | `min(field.height, 50)`                 | numbers                                                                                                  |
| `pattern`                        | `pattern(field.phone, /^\d{10}$/)`      |                                                                                                          |
| `validate`                       | `validate(field.x, ({ value }) => ...)` | custom, one field                                                                                        |
| `validateHttp` / `validateAsync` | see section 4                           | async                                                                                                    |

Conditional rule:

```ts
// premium only
required(field.height, {
    message: 'Height is required for premium',
    when: ({ valueOf }) => valueOf(field.subscription) === 'premium',
});
```

---

## 2. Custom rule

A function that calls `validate(path, ctx => ...)`. Parameters = extra arguments.

```ts strong-password.validator.ts
import { SchemaPath, validate, ValidationError } from '@angular/forms/signals';

// reusable rule
export function strongPassword(path: SchemaPath<string>) {
    validate(path, ({ value }) => {
        const v = value() ?? '';
        const errors: ValidationError[] = [];

        if (!/[a-z]/.test(v))
            errors.push({ kind: 'lowercase', message: 'At least one lowercase letter' });
        if (!/[A-Z]/.test(v))
            errors.push({ kind: 'uppercase', message: 'At least one uppercase letter' });
        if (!/[0-9]/.test(v)) errors.push({ kind: 'number', message: 'At least one digit' });
        if (!/[\W_]/.test(v))
            errors.push({ kind: 'specialChar', message: 'At least one special character' });
        if (v.length < 8) errors.push({ kind: 'minlength', message: 'At least 8 characters' });

        // undefined = valid
        return errors.length ? errors : undefined;
    });
}
```

```ts birthdate.validator.ts
// with parameters
export function birthdate(path: SchemaPath<string>, opts: { minAge?: number; maxAge?: number }) {
    validate(path, ({ value }) => {
        const v = value();
        if (!v) return undefined; // empty: required's job

        const date = toDate(v); // 'YYYY-MM-DD' → local Date
        if (!date) return { kind: 'invalidDate', message: 'Invalid date' };

        const age = getAge(date);
        const errors: ValidationError[] = [];
        if (opts.minAge !== undefined && age < opts.minAge) {
            errors.push({
                kind: 'minAge',
                message: `You must be at least ${opts.minAge} years old`,
            });
        }
        if (opts.maxAge !== undefined && age > opts.maxAge) {
            errors.push({
                kind: 'maxAge',
                message: `You must be at most ${opts.maxAge} years old`,
            });
        }
        return errors.length ? errors : undefined;
    });
}
```

```ts signal-validators.component.ts
customModel = signal({ password: '', birthdate: '' });

customForm = form(this.customModel, (field) => {
    required(field.password, { message: 'Password is required' });
    strongPassword(field.password); // custom rule

    required(field.birthdate, { message: 'Birthdate is required' });
    birthdate(field.birthdate, { minAge: 18, maxAge: 120 }); // with parameters
});
```

---

## 3. Cross-field rule

`valueOf(otherPath)` reads another field. The rule re-runs when **either** field changes, and the error lands on the field itself (no group like in reactive forms).

```ts match-field.validator.ts
import { SchemaPath, validate } from '@angular/forms/signals';

// valueOf = other field
export function matchField(
    path: SchemaPath<string>,
    other: SchemaPath<string>,
    message = "Passwords don't match",
) {
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
<input
    type="password"
    class="form-control"
    [formField]="crossForm.confirmPassword"
    [class.is-invalid]="confirm.touched() && confirm.invalid()"
/>

<!-- normal error block -->
@if (confirm.touched()) { @for (error of confirm.errors(); track error.kind) {
<div class="invalid-feedback">{{ error.message }}</div>
} }
```

---

## 4. Async rule

`validateHttp()` takes a **request** (URL + params), not an Observable, so it calls json-server directly instead of `UserService`. It only reads `users.length`: the password is never shown.

```ts email-taken.validator.ts
import { SchemaPath, validateHttp } from '@angular/forms/signals';
import { UserEntity } from '@core/entities/user.entity';
import { environment } from '@env/environment';

// Async: GET /people?email=...
export function emailTaken(path: SchemaPath<string>) {
    validateHttp(path, {
        // undefined = skip
        request: ({ value }) =>
            value()
                ? { url: `${environment.apiUrl}/people`, params: { email: value() } }
                : undefined,
        onSuccess: (users: UserEntity[]) =>
            users.length > 0
                ? { kind: 'emailTaken', message: 'This email is already taken' }
                : undefined,
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
<input
    type="email"
    class="form-control"
    [formField]="asyncForm.email"
    [class.is-invalid]="mail.touched() && mail.invalid()"
/>

<!-- while waiting -->
@if (mail.pending()) {
<div class="form-text">Checking the email...</div>
} @if (mail.touched()) { @for (error of mail.errors(); track error.kind) {
<div class="invalid-feedback">{{ error.message }}</div>
} }
```

> 💡 `debounce: 400` only slows the **request**. `debounce(field.email, 400)` (from `@angular/forms/signals`) slows **everything** for that field, sync rules too.

---

## 🐛 Troubleshooting

### `Can't bind to 'formField' since it isn't a known property of 'input'`

`FormField` is missing from `imports: []`.

### `errors()` is empty but `valid()` is false

An async rule is running: `pending()` is `true`. While pending, `valid()` and `invalid()` are both `false`.

### The `emailTaken` error never shows

1. A sync rule on the field fails first (async waits for them).
2. The API is down: you'll see `serverError` → `npm run dev`.
3. `provideHttpClient()` missing in `app.config.ts`.

### A rule shows its error on an empty field

Return `undefined` when the value is empty, and let `required()` complain (see `birthdate` and `matchField`).

### The page reloads on submit

Call `event.preventDefault()` in `onSubmit(event)`, and use `(submit)`, not `(ngSubmit)`.
