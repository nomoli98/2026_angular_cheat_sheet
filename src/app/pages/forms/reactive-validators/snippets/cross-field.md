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
