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
