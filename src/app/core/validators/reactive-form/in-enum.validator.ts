import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function enumValidator(enumType: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // empty is OK (optional)
    }

    const isValid = Object.values(enumType).includes(control.value);

    return isValid ? null : { invalidEnum: { value: control.value } };
  };
}
