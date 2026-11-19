# Template-driven form: step by step

> 📖 **Official docs:** [Template-driven forms](https://angular.dev/guide/forms/template-driven-forms) · [Validating form input](https://angular.dev/guide/forms/form-validation)

The form lives in the **HTML**. You write plain attributes (`required`, `email`, `min`...) and `[(ngModel)]` keeps a TS object in sync with the inputs.

Files: `template-form.component.ts`, `template-form.component.html`

---

## 1. Import `FormsModule` in the component

```ts
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  imports: [FormsModule],
  templateUrl: './template-form.component.html',
})
```

`FormsModule` gives you `ngForm`, `ngModel` and the built-in validator attributes.

## 2. Create a plain object for the data

```ts
user = {
  name: '',
  email: '',
  password: '',
  birthdate: '',
  height: 50,
  gender: GenderEnum.OTHER,
  subscription: 'free',
  agreeToTerms: false,
};

// To use an enum in the HTML, expose it on the class
protected readonly GenderEnum = GenderEnum;
```

## 3. Add the `<form>` and get a reference to it

```html
<form #form="ngForm" (ngSubmit)="onSubmit(form)">
  ...
</form>
```

- Angular attaches `ngForm` to every `<form>` automatically.
- `#form="ngForm"` gives you a variable to read `form.invalid`, `form.value`, etc.
- Use `(ngSubmit)`, not `(submit)`.

## 4. Bind each input with `[(ngModel)]`

```html
<input type="text" id="name" name="name"
       [(ngModel)]="user.name" #name="ngModel"
       required />
```

- `[(ngModel)]="user.name"`: two-way binding with the object.
- `name="name"` is **required** inside a form. Without it Angular throws an error.
- `#name="ngModel"` gives you this field's state (`name.invalid`, `name.touched`).

## 5. Add validators as HTML attributes

| Rule | Attribute |
|---|---|
| Not empty | `required` |
| Checkbox must be checked | `required` on the checkbox |
| Valid email | `email` |
| Number range | `min="50" max="275"` |
| Text length | `minlength="3" maxlength="20"` |
| Regex | `pattern="[a-z]+"` |

```html
<input type="email" name="email" [(ngModel)]="user.email" #email="ngModel" required email />
<input type="number" name="height" [(ngModel)]="user.height" #height="ngModel" min="50" max="275" />
```

## 6. Show the errors

```html
<input ... class="form-control" [class.is-invalid]="name.invalid && name.touched" />

@if (name.invalid && name.touched) {
  <div class="invalid-feedback">Enter valid name</div>
}
```

`[class.is-invalid]="condition"` adds the class only when the condition is true (no `NgClass` needed). `.is-invalid` and `.invalid-feedback` are Bootstrap classes, see [BOOTSTRAP.md](../../../../../BOOTSTRAP.md).

Check `touched` too, so the error doesn't show before the user has even clicked the field.

To show a different message per rule, read `errors`:

```html
@if (email.errors?.['required']) { <p>Email is required</p> }
@if (email.errors?.['email']) { <p>Email is not valid</p> }
```

## 7. Selects, radios and checkboxes

```html
<!-- Select: use [value] to bind an enum value -->
<select name="gender" [(ngModel)]="user.gender" #gender="ngModel" required>
  <option value="">Choose a gender...</option>
  <option [value]="GenderEnum.FEMALE">{{ GenderEnum.FEMALE }}</option>
</select>

<!-- Radios: same name = one single field -->
<input type="radio" name="subscription" value="free"    [(ngModel)]="user.subscription" #subscription="ngModel" />
<input type="radio" name="subscription" value="premium" [(ngModel)]="user.subscription" />

<!-- Checkbox: the value is true / false -->
<input type="checkbox" name="agreeToTerms" [(ngModel)]="user.agreeToTerms" #agreeToTerms="ngModel" required />
```

## 8. Submit

```ts
onSubmit(form: NgForm) {
  form.control.markAllAsTouched(); // show every error at once
  if (form.invalid) return;

  this.loading.set(true);
  // call your service with this.user
}
```

```html
<button type="submit" [disabled]="form.invalid || loading()">Register</button>
```

To reset afterwards: `form.resetForm()`.

---

## Custom validator: a directive

With template-driven forms, a custom validator is a **directive** that you put on the input as an attribute.

### Step 1: create the directive

```ts
import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appStrongPassword]',
  // Register this directive in Angular's list of validators
  providers: [{ provide: NG_VALIDATORS, useExisting: StrongPasswordDirective, multi: true }],
})
export class StrongPasswordDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const password: string = control.value;
    if (!password) return null; // empty: let "required" handle it

    const ok =
      password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);

    return ok ? null : { strongPassword: true };
  }
}
```

The rules:
- Return `null` if the value is **valid**.
- Return an object like `{ errorName: true }` if it's **invalid**. That key is what shows up in `field.errors`.
- Return `null` for empty values, and let `required` handle those.
- Don't forget `multi: true`, or you'll replace all the other validators.

### Step 2: import it in the component and use it

```ts
import { StrongPasswordDirective } from '@core/validators/template-form/strong-password.directive';

imports: [FormsModule, StrongPasswordDirective],
```

```html
<input type="password" name="password" [(ngModel)]="user.password" #password="ngModel" required appStrongPassword />
```

### With parameters: use `@Input()`

```ts
@Directive({
  selector: '[appBirthdate]',
  providers: [{ provide: NG_VALIDATORS, useExisting: BirthdateDirective, multi: true }],
})
export class BirthdateDirective implements Validator {
  @Input() minAge = 0;
  @Input() maxAge = 135;

  validate(control: AbstractControl): ValidationErrors | null { /* uses this.minAge / this.maxAge */ }
}
```

```html
<input type="date" name="birthdate" [(ngModel)]="user.birthdate" appBirthdate [minAge]="0" [maxAge]="135" />
```

**Trick:** if the `@Input()` has the **same name as the selector**, you pass the value directly on the attribute:

```ts
@Directive({ selector: '[appInEnum]', ... })
export class InEnumDirective implements Validator {
  @Input() appInEnum: object = {};
}
```

```html
<select name="gender" [(ngModel)]="user.gender" [appInEnum]="GenderEnum">...</select>
<input type="radio" name="subscription" [(ngModel)]="user.subscription" [appInList]="['free', 'premium']" />
```

The directives in this repo are in `core/validators/template-form/`:
- `strong-password.directive.ts`: `appStrongPassword`
- `birthday.directive.ts`: `appBirthdate` + `[minAge]` / `[maxAge]`
- `in-enum.directive.ts`: `[appInEnum]="SomeEnum"`
- `in-list.directive.ts`: `[appInList]="['a', 'b']"`
