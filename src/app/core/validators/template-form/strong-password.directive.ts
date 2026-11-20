import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/** 8+ chars, upper, lower, digit: <input appStrongPassword /> */
@Directive({
  selector: '[appStrongPassword]',
  providers: [{ provide: NG_VALIDATORS, useExisting: StrongPasswordDirective, multi: true }],
})
export class StrongPasswordDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const password: string = control.value;

    // empty: required handles it
    if (!password) {
      return null;
    }

    const isLongEnough = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (isLongEnough && hasUppercase && hasLowercase && hasNumber) {
      return null;
    }

    return { strongPassword: true };
  }
}
