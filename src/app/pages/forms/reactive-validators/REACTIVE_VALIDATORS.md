# Validators in Reactive Forms

> 📖 **Official docs:** [Validating form input](https://angular.dev/guide/forms/form-validation)

How to validate a **reactive form**: built-in, custom, cross-field and async validators.
Live demo: **`/form/reactive-validators`** (each section shows the `errors` object while you type).
The full register form is in [`../reactive-form/REACTIVE_FORM.md`](../reactive-form/REACTIVE_FORM.md).

```
src/app/core/validators/reactive-form/
├── strong-password.validator.ts   ← custom
├── birthdate.validator.ts         ← custom with parameters
├── in-enum.validator.ts           ← custom (value must be in an enum)
├── in-string-list.validator.ts    ← custom (value must be in a list)
├── match-fields.validator.ts      ← cross-field (on the group)
└── email-taken.validator.ts       ← async
```

A validator is a **function**: it gets the control and returns `null` (valid) or an **error object** (`{ errorKey: anything }`).

---

## 1. Built-in validators

```ts reactive-validators.component.ts
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule], // required import
  ...
})
export class ReactiveValidatorsComponent {
  builtInForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true, // no null on reset
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    }),
    height: new FormControl(50, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(50), Validators.max(275)],
    }),
    agreeToTerms: new FormControl(false, {
      nonNullable: true,
      validators: Validators.requiredTrue, // checkbox must be checked
    }),
  });
}
```

```html reactive-validators.component.html
<form [formGroup]="builtInForm">
  @let name = builtInForm.controls.name;
  <input class="form-control" formControlName="name"
         [class.is-invalid]="name.invalid && name.touched" />

  @if (name.touched) {
    @if (name.hasError('required')) { <div class="invalid-feedback">Name is required</div> }
    <!-- lowercase key! -->
    @if (name.hasError('minlength')) {
      <div class="invalid-feedback">At least {{ name.getError('minlength').requiredLength }} characters</div>
    }
  }

  @let height = builtInForm.controls.height;
  <input type="number" class="form-control" formControlName="height" />
  @if (height.touched && height.hasError('min')) {
    <div class="invalid-feedback">Minimum {{ height.getError('min').min }} cm</div>
  }
</form>
```

### The error keys

⚠️ The key is not always the validator's name (lowercase!).

| Validator | Error key | Error value |
| --------- | --------- | ----------- |
| `Validators.required` / `requiredTrue` | `required` | `true` |
| `Validators.email` | `email` | `true` |
| `Validators.minLength(n)` / `maxLength(n)` | **`minlength`** / **`maxlength`** | `{ requiredLength, actualLength }` |
| `Validators.min(n)` / `max(n)` | `min` / `max` | `{ min, actual }` / `{ max, actual }` |
| `Validators.pattern(re)` | `pattern` | `{ requiredPattern, actualValue }` |

---

## 2. Custom validator

A factory function that returns a `ValidatorFn`. Parameters go to the factory: `birthdateValidator(18, 120)`.

```ts strong-password.validator.ts
import { ValidatorFn } from '@angular/forms';

interface StrongPasswordErrors {
  lowercase?: boolean;
  uppercase?: boolean;
  number?: boolean;
  specialChar?: boolean;
  minlength?: boolean;
}

// factory → ValidatorFn
export function strongPasswordValidator(): ValidatorFn {
  return (control) => {
    const value: string = control.value;
    const result: StrongPasswordErrors = {};

    if (!/[a-z]/.test(value)) result.lowercase = true;
    if (!/[A-Z]/.test(value)) result.uppercase = true;
    if (!/[0-9]/.test(value)) result.number = true;
    if (!/[\W_]/.test(value)) result.specialChar = true;
    if (value.length < 8) result.minlength = true;

    // null = valid
    return Object.keys(result).length > 0 ? result : null;
  };
}
```

```ts birthdate.validator.ts
// with parameters
export function birthdateValidator(minAge?: number, maxAge?: number): ValidatorFn {
  return (control) => {
    const value: string | null = control.value;
    if (!value) return null; // empty: required's job

    const userBirthdate = parseDate(value); // 'YYYY-MM-DD' → local Date
    if (!userBirthdate) return { invalidDate: true };

    const result: BirthdateErrors = {};
    if (minAge && yearsAgo(minAge) < userBirthdate) {
      result.minAge = true;
      result.minAgeValue = minAge; // data for template
    }
    if (maxAge && yearsAgo(maxAge) > userBirthdate) {
      result.maxAge = true;
      result.maxAgeValue = maxAge;
    }
    return Object.keys(result).length > 0 ? result : null;
  };
}
```

```ts reactive-validators.component.ts
customForm = new FormGroup({
  password: new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, strongPasswordValidator()],
  }),
  birthdate: new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, birthdateValidator(18, 120)],
  }),
});
```

```html reactive-validators.component.html
@let password = customForm.controls.password;
@if (password.touched && password.invalid) {
  <div class="invalid-feedback">
    @if (password.hasError('required')) { Password is required }
    @else {
      Missing:
      @if (password.hasError('lowercase')) { a lowercase · }
      @if (password.hasError('uppercase')) { an uppercase · }
      @if (password.hasError('number')) { a digit · }
      @if (password.hasError('specialChar')) { a symbol · }
      @if (password.hasError('minlength')) { 8 characters }
    }
  </div>
}

@let birthdate = customForm.controls.birthdate;
@if (birthdate.touched && birthdate.hasError('minAge')) {
  <div class="invalid-feedback">You must be at least {{ birthdate.getError('minAgeValue') }}</div>
}
```

> 💡 Return **one key per problem** (like `strongPasswordValidator`), so the template can say exactly what's missing.

---

## 3. Cross-field validator (password === confirmPassword)

A control's validator can't see the other controls. Put the validator on the **group**.

```ts match-fields.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// goes on the group
export function matchFieldsValidator(field: string, confirmField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const value = group.get(field)?.value;
    const confirm = group.get(confirmField)?.value;
    if (!confirm) return null; // empty: required's job
    return value === confirm ? null : { fieldsMismatch: true };
  };
}
```

```ts reactive-validators.component.ts
crossForm = new FormGroup(
  {
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: Validators.required }),
  },
  { validators: matchFieldsValidator('password', 'confirmPassword') }, // group validator
);
```

```html reactive-validators.component.html
@let confirm = crossForm.controls.confirmPassword;
<!-- error on the GROUP -->
@let mismatch = confirm.touched && crossForm.hasError('fieldsMismatch');

<input type="password" class="form-control" formControlName="confirmPassword"
       [class.is-invalid]="(confirm.invalid && confirm.touched) || mismatch" />

@if (confirm.touched && confirm.hasError('required')) {
  <div class="invalid-feedback">Please confirm the password</div>
} @else if (mismatch) {
  <div class="invalid-feedback">Passwords don't match</div>
}
```

> ⚠️ The error is on the **group**: `crossForm.hasError('fieldsMismatch')`, not on `confirmPassword`.

---

## 4. Async validator (email already taken)

Returns an **Observable**. Angular cancels the previous one when the value changes, so `timer(400)` = a free debounce.

```ts email-taken.validator.ts
import { inject } from '@angular/core';
import { AsyncValidatorFn } from '@angular/forms';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { UserService } from '@core/services/user.service';

// returns an Observable
export function emailTakenValidator(): AsyncValidatorFn {
  const userService = inject(UserService); // injection context only

  return (control) => {
    if (!control.value) return of(null);

    return timer(400).pipe( // free debounce
      switchMap(() => userService.emailExists(control.value)),
      map((taken) => (taken ? { emailTaken: true } : null)),
      catchError(() => of(null)), // API down = valid
    );
  };
}
```

```ts reactive-validators.component.ts
asyncForm = new FormGroup({
  email: new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
    asyncValidators: [emailTakenValidator()], // separate key
  }),
});
```

```html reactive-validators.component.html
@let email = asyncForm.controls.email;
<input type="email" class="form-control" formControlName="email"
       [class.is-invalid]="email.invalid && email.touched" />

<!-- while waiting -->
@if (email.pending) { <div class="form-text">Checking the email...</div> }

@if (email.touched && email.hasError('emailTaken')) {
  <div class="invalid-feedback">This email is already taken</div>
}
```

> 💡 Async validators only run when **all sync validators pass** (no request for `"bo"`).

---

## 5. Bonus

```ts
ctrl.addValidators(Validators.max(220));
ctrl.removeValidators(Validators.required); // same reference only
ctrl.updateValueAndValidity();             // re-run validators
```

> ⚠️ `removeValidators` compares references: it works with `Validators.required`, not with `Validators.max(220)` (each call makes a new function). Keep it in a variable to remove it later.

```ts
// check on blur
email: new FormControl('', { validators: [...], asyncValidators: [...], updateOn: 'blur' }),
```

---

## 🐛 Troubleshooting

### `hasError('minLength')` is always false

The key is **lowercase**: `minlength` / `maxlength`.

### Passwords don't match but `confirm.invalid` is false

Normal: the cross-field error is on the **group**. Use `crossForm.hasError('fieldsMismatch')`.

### `NG0203: inject() must be called from an injection context`

`emailTakenValidator()` calls `inject()`. Call it in a **field initializer** or the **constructor**, never in a method like `onSubmit()`.

### The async validator never runs

A sync validator is failing (async waits for them), or the API is down (`catchError` returns `null` silently: check the Network tab, then `npm run dev`).

### Submit does nothing, no errors shown

Call `markAllAsTouched()` first: the errors exist but stay hidden while `touched` is false.

### `Can't bind to 'formGroup' since it isn't a known property of 'form'`

`ReactiveFormsModule` is missing from the component's `imports: []`.
