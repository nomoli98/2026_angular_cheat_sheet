import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/**
 * Checks that the password has:
 * - at least 8 characters
 * - one uppercase letter
 * - one lowercase letter
 * - one number
 *
 * Usage: <input name="password" [(ngModel)]="..." appStrongPassword />
 */
@Directive({
  selector: '[appStrongPassword]',
  providers: [{ provide: NG_VALIDATORS, useExisting: StrongPasswordDirective, multi: true }],
})
export class StrongPasswordDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const password: string = control.value;

    // Empty field: let "required" handle it
    if (!password) {
      return null;
    }

    const isLongEnough = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (isLongEnough && hasUppercase && hasLowercase && hasNumber) {
      return null; // valid
    }

    return { strongPassword: true }; // invalid
  }
}
