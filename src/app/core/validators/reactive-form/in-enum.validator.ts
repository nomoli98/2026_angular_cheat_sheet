import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function enumValidator(enumType: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Don't validate empty values to allow optional controls
    }

    const isValid = Object.values(enumType).includes(control.value);

    return isValid ? null : { invalidEnum: { value: control.value } };
  };
}
