# Reactive form: step by step

> 📖 **Official docs:** [Reactive forms](https://angular.dev/guide/forms/reactive-forms) · [Validating form input](https://angular.dev/guide/forms/form-validation)

The form lives in the **TS**. You build a `FormGroup` of `FormControl`s with their validators, then bind the HTML to it.

Files: `reactive-form.component.ts`, `reactive-form.component.html`

---

## 1. Import `ReactiveFormsModule` in the component

```ts
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  templateUrl: './reactive-form.component.html',
})
```

## 2. Inject the `FormBuilder`

```ts
private readonly _formBuilder = inject(FormBuilder);
protected readonly GenderEnum = GenderEnum; // to use the enum in the HTML
```

## 3. Build the form group

```ts
formRegister = this._formBuilder.group({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, strongPasswordValidator()]),
    // 'YYYY-MM-DD' string: <input type="date"> reads and writes that format directly
    birthdate: new FormControl('', [Validators.required, birthdateValidator(0, 135)]),
    height: new FormControl(50, [Validators.min(50), Validators.max(275)]),
    gender: new FormControl(GenderEnum.OTHER, [Validators.required, enumValidator(GenderEnum)]),
    subscription: new FormControl<'free' | 'premium'>('free', [
        Validators.required,
        inValidator(['free', 'premium']),
    ]),
    agreeToTerms: new FormControl(false, Validators.requiredTrue),
});
```

`new FormControl(initialValue, validators)`: one validator alone, or an array of them.

Built-in validators:

| Rule                     | Validator                                             |
| ------------------------ | ----------------------------------------------------- |
| Not empty                | `Validators.required`                                 |
| Checkbox must be checked | `Validators.requiredTrue`                             |
| Valid email              | `Validators.email`                                    |
| Number range             | `Validators.min(50)`, `Validators.max(275)`           |
| Text length              | `Validators.minLength(3)`, `Validators.maxLength(20)` |
| Regex                    | `Validators.pattern(/[a-z]+/)`                        |

Shorter syntax with the builder (same result):

```ts
this._formBuilder.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
});
```

## 4. Bind the HTML

```html
<form [formGroup]="formRegister" (ngSubmit)="onSubmit()">
    <input type="text" id="name" formControlName="name" />
</form>
```

- `[formGroup]` on the `<form>` links it to your `FormGroup`.
- `formControlName="name"` on each input. It must match the key in the group.
- Selects, radios and checkboxes use `formControlName` the same way:

```html
<select formControlName="gender">
    <option value="">Choose a gender...</option>
    <option value="{{GenderEnum.FEMALE}}">{{ GenderEnum.FEMALE }}</option>
</select>

<input type="radio" value="free" formControlName="subscription" />
<input type="radio" value="premium" formControlName="subscription" />

<input type="checkbox" formControlName="agreeToTerms" />
```

## 5. Show the errors

```html
<input
    formControlName="email"
    class="form-control"
    [class.is-invalid]="formRegister.get('email')?.invalid && formRegister.get('email')?.touched"
/>

@if (formRegister.get('email')?.invalid && formRegister.get('email')?.touched) {
<div class="invalid-feedback">Enter valid email address</div>
}
```

`[class.is-invalid]="condition"` adds the class only when the condition is true (no `NgClass` needed). `.is-invalid` and `.invalid-feedback` are Bootstrap classes, see [BOOTSTRAP.md](../../theme/bootstrap/BOOTSTRAP.md).

A message per rule:

```html
@if (formRegister.get('email')?.hasError('required')) {
<p>Email is required</p>
} @if (formRegister.get('email')?.hasError('email')) {
<p>Email is not valid</p>
}
```

**Tip:** `formRegister.controls.email` is typed. `formRegister.get('email')` is not.

## 6. Submit

```ts
onSubmit() {
  this.formRegister.markAllAsTouched(); // show every error at once
  if (this.formRegister.invalid) return;

  this.loading.set(true);
  const user: RegisterRequest = {
    name: this.formRegister.value.name!,
    email: this.formRegister.value.email!,
    // ...
  };
  // call your service with user
}
```

```html
<button type="submit" [disabled]="formRegister.invalid || loading()">Register</button>
```

Other useful things:

- `this.formRegister.value`: the values (the fields are `| undefined`, hence the `!`)
- `this.formRegister.getRawValue()`: the values including disabled fields, without `undefined`
- `this.formRegister.reset()`: clear the form
- `this.formRegister.patchValue({ name: 'Bob' })`: set some fields
- `this.formRegister.controls.email.valueChanges.subscribe(...)`: react when a value changes

---

## Custom validator: a function that returns a `ValidatorFn`

With reactive forms, a custom validator is **a function that returns a function**. The outer one takes your parameters, and the inner one receives the control.

### Step 1: write the validator

```ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function enumValidator(enumType: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null; // empty: let Validators.required handle it

        const isValid = Object.values(enumType).includes(control.value);
        return isValid ? null : { invalidEnum: { value: control.value } };
    };
}
```

The rules:

- Return `null` if the value is **valid**.
- Return an object `{ errorName: ... }` if it's **invalid**. You check for it with `hasError('errorName')`.
- Return `null` for empty values, and let `Validators.required` handle those.

### Step 2: add it to the control

```ts
gender: new FormControl(GenderEnum.OTHER, [Validators.required, enumValidator(GenderEnum)]),
```

⚠️ **Always call it with `()`**, even without parameters: `strongPasswordValidator()`, not `strongPasswordValidator`.

### Return several errors at once

```ts
export function strongPasswordValidator(): ValidatorFn {
    return (control) => {
        const value: string = control.value ?? '';
        const result: Record<string, boolean> = {};

        if (!/[a-z]/.test(value)) result['lowercase'] = true;
        if (!/[A-Z]/.test(value)) result['uppercase'] = true;
        if (!/[0-9]/.test(value)) result['number'] = true;
        if (!/[\W_]/.test(value)) result['specialChar'] = true;
        if (value.length < 8) result['minlength'] = true;

        return Object.keys(result).length > 0 ? result : null;
    };
}
```

```html
@if (formRegister.get('password')?.hasError('uppercase')) {
<p>Needs an uppercase letter</p>
}
```

The validators in this repo are in `core/validators/reactive-form/`. Import them with the `@core` alias:

```ts
import { strongPasswordValidator } from '@core/validators/reactive-form/strong-password.validator';
import { birthdateValidator } from '@core/validators/reactive-form/birthdate.validator';
import { enumValidator } from '@core/validators/reactive-form/in-enum.validator';
import { inValidator } from '@core/validators/reactive-form/in-string-list.validator';
import { emailTakenValidator } from '@core/validators/reactive-form/email-taken.validator';
```

- `strong-password.validator.ts`: `strongPasswordValidator()`
- `birthdate.validator.ts`: `birthdateValidator(minAge, maxAge)`
- `in-enum.validator.ts`: `enumValidator(SomeEnum)`
- `in-string-list.validator.ts`: `inValidator(['a', 'b'])`
- `email-taken.validator.ts`: `emailTakenValidator()` (async, asks the API)

---

## Async validator: ask the server ("is this email taken?")

A normal validator answers **right away**. An async validator answers **later**: it returns an **Observable** (or a Promise) of the errors.

### Step 1: write it

```ts
// core/validators/reactive-form/email-taken.validator.ts
import { inject } from '@angular/core';
import { AsyncValidatorFn } from '@angular/forms';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { UserService } from '@core/services/user.service';

export function emailTakenValidator(): AsyncValidatorFn {
    const userService = inject(UserService); // ⚠️ needs an injection context (see below)

    return (control) => {
        if (!control.value) return of(null); // empty: let Validators.required handle it

        return timer(400).pipe(
            // wait 400 ms
            switchMap(() => userService.emailExists(control.value)), // GET /people?email=... → true/false
            map((taken) => (taken ? { emailTaken: true } : null)), // true → error, false → valid
            catchError(() => of(null)), // API down: don't block the form
        );
    };
}
```

| Piece                        | Why                                                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `AsyncValidatorFn`           | the type of an async validator (instead of `ValidatorFn`)                                                                  |
| `timer(400)`                 | a **debounce**: Angular cancels the previous Observable on every key, so the API is called only when the user stops typing |
| `switchMap`                  | "when the timer ends, switch to the HTTP request"                                                                          |
| `catchError(() => of(null))` | if the API fails, the field stays valid instead of stuck                                                                   |

### Step 2: add it to the control

Async validators go in a **separate** list, `asyncValidators`:

```ts
email: new FormControl('', {
  validators: [Validators.required, Validators.email],   // sync: run first
  asyncValidators: [emailTakenValidator()],              // async: run only if the sync ones pass
}),
```

> ⚠️ `emailTakenValidator()` calls `inject()`, so call it in a **field initializer** (like above) or the constructor. Called inside `onSubmit()` → `NG0203: inject() must be called from an injection context`.

### Step 3: show it in the HTML

While the API is answering, the control is **`pending`** (not valid, not invalid):

```html
@if (formRegister.get('email')?.pending) {
<div class="form-text">Checking the email...</div>
} @if (formRegister.get('email')?.hasError('emailTaken')) {
<div class="invalid-feedback">This email is already taken</div>
}
```

| Status               | Meaning                                                              |
| -------------------- | -------------------------------------------------------------------- |
| `pending`            | the async validator is still running                                 |
| `valid` / `invalid`  | final answer                                                         |
| `formRegister.valid` | `false` while a field is `pending` → the submit waits for the answer |

> 💡 The validator makes the UI nicer, but it's not a guarantee: two people can type the same email at the same time. That's why `AuthService.register()` checks the email **again** before creating the user.
