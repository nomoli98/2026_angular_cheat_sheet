import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function inValidator(stringList: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;

        for (let s of stringList) {
            if (control.value == s) return null;
        }

        return { inValidList: { value: control.value } };
    };
}
