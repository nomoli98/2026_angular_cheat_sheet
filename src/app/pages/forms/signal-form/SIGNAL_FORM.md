# Signal form: step by step

> 📖 **Official docs:** [Signal forms overview](https://angular.dev/guide/forms/signals/overview) · [Validation](https://angular.dev/guide/forms/signals/validation)

The new forms API (`@angular/forms/signals`). Your data is a **`signal`**, you describe the validation in a **schema function**, and Angular gives you a **field tree** where every field is a signal with its value, state and errors (with their messages).

Files: `signal-form.component.ts`, `signal-form.component.html`

---

## 1. Define the model type and its initial value

```ts
// core/models/user.interface.ts
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  birthdate: Date | null;
  height: number;
  gender: GenderEnum;
  subscription: 'free' | 'premium';
  agreeToTerms: boolean;
}
```

```ts
// core/factories/register.factory.ts
export function initialRegisterData(): RegisterData {
  return { name: '', email: '', password: '', birthdate: null, height: 50,
           gender: GenderEnum.OTHER, subscription: 'free', agreeToTerms: false };
}
```

Use a **function** that returns a new object each time. That way the reset always starts from a clean object.

## 2. Import `FormField` in the component

```ts
import { email, form, FormField, max, min, required, validate } from '@angular/forms/signals';

@Component({
  imports: [FormField],
  templateUrl: './signal-form.component.html',
})
```

## 3. Create the model signal

```ts
protected EmptyForm = signal<RegisterData>(initialRegisterData());
```

## 4. Create the form with `form(model, schema)`

```ts
protected registerForm = form(this.EmptyForm, (field) => {
  required(field.name, { message: 'Name is required' });

  required(field.email, { message: 'Email is required' });
  email(field.email, { message: 'Email must be a valid email' });

  min(field.height, 50, { message: 'Height must be above 50cm' });
  max(field.height, 275, { message: 'Height must be below 275cm' });
});
```

- `field` mirrors your model: `field.name`, `field.email`...
- Each rule is a function call on a field, and you give the error message right there.

Built-in rules:

| Rule | Function |
|---|---|
| Not empty | `required(field.x, { message })` |
| Valid email | `email(field.x, { message })` |
| Number range | `min(field.x, 50)`, `max(field.x, 275)` |
| Text length | `minLength(field.x, 3)`, `maxLength(field.x, 20)` |
| Regex | `pattern(field.x, /[a-z]+/)` |
| Anything else | `validate(field.x, ({ value }) => ...)` (see below) |

## 5. Bind the HTML with `[formField]`

```html
<form (submit)="onSubmit($event)">
  <input id="name" type="text" [formField]="registerForm.name" />
</form>
```

- `[formField]="registerForm.name"` on every input: text, number, date, select, radio or checkbox.
- There's no `[formGroup]` on the `<form>`, and no `name` attribute is needed.

```html
<select [formField]="registerForm.gender">
  <option value="">Choose a gender...</option>
  <option value="{{GenderEnum.FEMALE}}">{{ GenderEnum.FEMALE }}</option>
</select>

<input type="radio" value="free"    [formField]="registerForm.subscription" />
<input type="radio" value="premium" [formField]="registerForm.subscription" />

<input type="checkbox" [formField]="registerForm.agreeToTerms" />
```

## 6. Show the errors

Call the field to get its state: `registerForm.name()`. Then every property is a signal too: `.touched()`, `.invalid()`, `.errors()`, `.value()`.

```html
<input class="form-control" [formField]="registerForm.name"
       [class.is-invalid]="registerForm.name().touched() && registerForm.name().invalid()">

@if (registerForm.name().touched()) {
  @for (error of registerForm.name().errors(); track error.kind) {
    <div class="invalid-feedback">{{ error.message }}</div>
  }
}
```

`.is-invalid` and `.invalid-feedback` are Bootstrap classes, see [BOOTSTRAP.md](../../../../../BOOTSTRAP.md).

The messages come from the schema, so you don't write them in the HTML.

## 7. Submit

```ts
onSubmit(event: Event) {
  event.preventDefault(); // no ngSubmit here, so stop the page reload yourself
  if (this.registerForm().invalid()) return;

  const data = this.registerForm().value(); // or this.EmptyForm()
  // call your service with data

  this.resetForm();
}
```

```html
<button type="submit" [disabled]="registerForm().invalid()">Submit</button>
```

- `registerForm()` (with `()`) = the state of the **whole** form.
- `registerForm.name()` = the state of **one** field.

## 8. Reset

Reset takes two steps:

```ts
resetForm() {
  this.EmptyForm.set(initialRegisterData()); // 1. values back to defaults
  this.registerForm().reset();               // 2. clear touched / dirty
}
```

## 9. Change a value from the TS

```ts
const field = this.registerForm.subscription();
field.value.set('premium');
field.markAsTouched();
```

The component uses this in `toggleSubscription()` so that a second click on a selected radio unselects it.

---

## Custom validator: `validate()`

### Inline in the schema

```ts
validate(field.gender, ({ value }) => {
  if (!value()) return undefined; // empty: let required() handle it

  const GENDERS = Object.values(GenderEnum) as string[];
  if (!GENDERS.includes(value())) {
    return { kind: 'invalidGender', message: `Gender must be one of: ${GENDERS.join(', ')}` };
  }
  return undefined;
});
```

The rules:
- Return `undefined` (or `null`) if the value is **valid**.
- Return `{ kind, message }` if it's **invalid**. `kind` is the error's id (used in `track error.kind`), and `message` is what you display.
- To return **several errors**, return an array of them.
- `value` is a signal, so read it with `value()`.

### Reusable: put it in its own function

Write a function that takes a `SchemaPath` and calls `validate` on it:

```ts
import { SchemaPath, validate, ValidationError } from '@angular/forms/signals';

export function strongPassword(path: SchemaPath<string>) {
  validate(path, ({ value }) => {
    const v = value() ?? '';
    const errors: ValidationError[] = [];

    if (!/[a-z]/.test(v)) errors.push({ kind: 'lowercase', message: 'At least one lowercase letter' });
    if (!/[A-Z]/.test(v)) errors.push({ kind: 'uppercase', message: 'At least one uppercase letter' });
    if (!/[0-9]/.test(v)) errors.push({ kind: 'number', message: 'At least one digit' });
    if (v.length < 8)     errors.push({ kind: 'minlength', message: 'At least 8 characters' });

    return errors.length ? errors : undefined;
  });
}
```

Then use it in the schema just like a built-in rule:

```ts
strongPassword(field.password);
```

### With parameters

Add a second argument:

```ts
export function birthdate<T extends Date | string | null | undefined>(
  path: SchemaPath<T>,
  opts: { minAge?: number; maxAge?: number },
) {
  validate(path, ({ value }) => { /* uses opts.minAge / opts.maxAge */ });
}
```

```ts
birthdate(field.birthdate, { minAge: 18, maxAge: 120 });
```

The validators in this repo are in `core/validators/signal-form/`:
- `strong-password.validator.ts`: `strongPassword(field.x)`
- `birthdate.validator.ts`: `birthdate(field.x, { minAge, maxAge })`
