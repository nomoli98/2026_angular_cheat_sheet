import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Cross-field: put it on the FormGroup, not on a control
export function matchFieldsValidator(field: string, confirmField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const value = group.get(field)?.value;
    const confirm = group.get(confirmField)?.value;
    if (!confirm) return null; // empty: required's job
    return value === confirm ? null : { fieldsMismatch: true };
  };
}
