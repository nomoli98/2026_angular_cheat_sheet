# Validators in Template-Driven Forms

> 📖 **Official docs:** [Validating input in template-driven forms](https://angular.dev/guide/forms/form-validation#validating-input-in-template-driven-forms)

How to validate a **template-driven form** (`ngModel`): the rules are **HTML attributes**, and each custom rule is a **directive**.
Live demo: **`/form/template-validators`**. The full register form is in [`../template-form/TEMPLATE_FORM.md`](../template-form/TEMPLATE_FORM.md).

```
src/app/core/validators/template-form/
├── strong-password.directive.ts   ← appStrongPassword
├── birthday.directive.ts          ← appBirthdate [minAge] [maxAge]
├── in-enum.directive.ts           ← [appInEnum]="GenderEnum"
├── in-list.directive.ts           ← [appInList]="['free', 'premium']"
├── match-fields.directive.ts      ← cross-field, on the <form>
└── email-taken.directive.ts       ← async
```

`#x="ngModel"` gives you the control: read `x.errors`, `x.touched`, `x.pending`.

---

## 1. Built-in attributes

```ts template-validators.component.ts
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule], // required import
  ...
})
export class TemplateValidatorsComponent {
  // plain object
  builtIn = { name: '', height: 50, agreeToTerms: false };
}
```

```html template-validators.component.html
<form #builtInForm="ngForm">
  <!-- name="" is mandatory -->
  <input name="name" class="form-control" [(ngModel)]="builtIn.name" #nameCtrl="ngModel"
         required minlength="2" maxlength="50"
         [class.is-invalid]="nameCtrl.invalid && nameCtrl.touched" />

  @if (nameCtrl.touched) {
    @if (nameCtrl.errors?.['required']) { <div class="invalid-feedback">Name is required</div> }
    @if (nameCtrl.errors?.['minlength']) {
      <div class="invalid-feedback">At least {{ nameCtrl.errors?.['minlength'].requiredLength }} characters</div>
    }
  }

  <!-- type="number" only -->
  <input name="height" type="number" class="form-control" [(ngModel)]="builtIn.height"
         #heightCtrl="ngModel" required min="50" max="275" />

  <!-- checkbox: must be checked -->
  <input name="agreeToTerms" type="checkbox" class="form-check-input"
         [(ngModel)]="builtIn.agreeToTerms" #termsCtrl="ngModel" required />
</form>
```

| Attribute | Error key | Works on |
| --------- | --------- | -------- |
| `required` | `required` | any input (on a checkbox → must be **checked**) |
| `minlength="2"` / `maxlength="50"` | `minlength` / `maxlength` | text |
| `email` | `email` | text / email |
| `pattern="[A-Z].*"` | `pattern` | text (the whole value must match) |
| `min="50"` / `max="275"` | `min` / `max` | `type="number"` only |

Dynamic value? Bind it: `[required]="isRequired"`, `[min]="minHeight"`.

---

## 2. Custom validator = a directive

The directive registers itself in `NG_VALIDATORS`. `ngModel` on the same element finds it and calls `validate()`.

```ts strong-password.directive.ts
import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appStrongPassword]',
  // multi: true!
  providers: [{ provide: NG_VALIDATORS, useExisting: StrongPasswordDirective, multi: true }],
})
export class StrongPasswordDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const password: string = control.value;
    if (!password) return null; // empty: required's job

    const isLongEnough = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (isLongEnough && hasUppercase && hasLowercase && hasNumber) return null;
    return { strongPassword: true };
  }
}
```

```ts birthday.directive.ts
@Directive({
  selector: '[appBirthdate]',
  providers: [{ provide: NG_VALIDATORS, useExisting: BirthdateDirective, multi: true }],
})
export class BirthdateDirective implements Validator {
  // parameters
  @Input() minAge = 0;
  @Input() maxAge = 135;

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    // ...'YYYY-MM-DD' → age
    if (age < this.minAge || age > this.maxAge) return { birthdate: true };
    return null;
  }
}
```

```ts template-validators.component.ts
@Component({
  // each directive!
  imports: [FormsModule, StrongPasswordDirective, BirthdateDirective],
  ...
})
export class TemplateValidatorsComponent {
  custom = { password: '', birthdate: '' };
}
```

```html template-validators.component.html
<input name="password" type="password" class="form-control"
       [(ngModel)]="custom.password" #passwordCtrl="ngModel" required appStrongPassword />
@if (passwordCtrl.touched && passwordCtrl.errors?.['strongPassword']) {
  <div class="invalid-feedback">8+ characters, an uppercase, a lowercase and a digit</div>
}

<!-- with parameters -->
<input name="birthdate" type="date" class="form-control"
       [(ngModel)]="custom.birthdate" #birthdateCtrl="ngModel"
       required appBirthdate [minAge]="18" [maxAge]="120" />
@if (birthdateCtrl.touched && birthdateCtrl.errors?.['birthdate']) {
  <div class="invalid-feedback">You must be 18 to 120 years old</div>
}
```

---

## 3. Cross-field validator (on the `<form>`)

`NgForm` picks up validators on the `<form>` element, and gives them the **whole group**. The directive reuses the reactive `matchFieldsValidator`.

```ts match-fields.directive.ts
import { Directive, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { matchFieldsValidator } from '../reactive-form/match-fields.validator';

@Directive({
  selector: '[appMatchFields]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MatchFieldsDirective, multi: true }],
})
export class MatchFieldsDirective implements Validator {
  readonly fields = input<[string, string]>(undefined, { alias: 'appMatchFields' }); // optional: NG0950

  // group = the whole form
  validate(group: AbstractControl): ValidationErrors | null {
    const fields = this.fields();
    if (!fields) return null; // runs before inputs
    const [field, confirmField] = fields;
    return matchFieldsValidator(field, confirmField)(group); // reuses reactive one
  }
}
```

```html template-validators.component.html
<!-- directive on the form -->
<form #crossForm="ngForm" [appMatchFields]="['password', 'confirmPassword']">
  <input name="password" type="password" class="form-control" [(ngModel)]="cross.password" required />

  <input name="confirmPassword" type="password" class="form-control"
         [(ngModel)]="cross.confirmPassword" #confirmCtrl="ngModel" required />

  <!-- error on the FORM -->
  @if (confirmCtrl.touched && crossForm.hasError('fieldsMismatch')) {
    <div class="invalid-feedback">Passwords don't match</div>
  }
</form>
```

> ⚠️ The names in the array are the **`name="..."` attributes** of the inputs.

---

## 4. Async validator (directive)

Same as a custom directive, but in **`NG_ASYNC_VALIDATORS`**, and `validate()` returns an Observable. It reuses the reactive `emailTakenValidator()`.

```ts email-taken.directive.ts
import { Directive } from '@angular/core';
import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { emailTakenValidator } from '../reactive-form/email-taken.validator';

@Directive({
  selector: '[appEmailTaken]',
  // ASYNC token
  providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: EmailTakenDirective, multi: true }],
})
export class EmailTakenDirective implements AsyncValidator {
  private readonly _validator = emailTakenValidator(); // reuses the reactive one

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this._validator(control) as Observable<ValidationErrors | null>;
  }
}
```

```html template-validators.component.html
<input name="email" type="email" class="form-control" [(ngModel)]="async.email"
       #emailCtrl="ngModel" required email appEmailTaken />

<!-- while waiting -->
@if (emailCtrl.pending) { <div class="form-text">Checking the email...</div> }

@if (emailCtrl.touched && emailCtrl.errors?.['emailTaken']) {
  <div class="invalid-feedback">This email is already taken</div>
}
```

---

## 🐛 Troubleshooting

### `NG01352: If ngModel is used within a form tag, either the name attribute must be set...`

Every `[(ngModel)]` inside a `<form>` needs a **`name="..."`**. Two inputs with the same name share one control (only OK for radios).

### My custom directive does nothing

1. Is it in the component's `imports: []`? (no error if it's missing: the attribute is just ignored!)
2. Is the selector right? `'[appStrongPassword]'` → attribute `appStrongPassword`, case-sensitive.
3. `multi: true` in the provider? Without it, it **replaces** the built-in validators.

### `NG0950: Input "fields" is required but no value is available yet`

`NgForm` runs the validators **before** the directive's inputs are set. Use an optional `input()` and `return null` while it's `undefined` (see `match-fields.directive.ts`).

### `NG0200: Circular dependency in DI detected`

You wrote `useClass` instead of `useExisting` in the provider.

### The mismatch error never shows

The directive must be on the **`<form>`**, and you read `crossForm.hasError(...)`, not `confirmCtrl.errors`.

### `x.errors.minlength` → `Property 'minlength' comes from an index signature`

Use brackets: `x.errors?.['minlength']`.

### `min="50"` does nothing

Only works on `type="number"`.
