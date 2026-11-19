import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/**
 * Checks that the age (calculated from the birthdate) is between minAge and maxAge.
 *
 * Usage: <input type="date" name="birthdate" [(ngModel)]="..." appBirthdate [minAge]="0" [maxAge]="135" />
 */
@Directive({
  selector: '[appBirthdate]',
  providers: [{ provide: NG_VALIDATORS, useExisting: BirthdateDirective, multi: true }],
})
export class BirthdateDirective implements Validator {
  @Input() minAge = 0;
  @Input() maxAge = 135;

  validate(control: AbstractControl): ValidationErrors | null {
    // Empty field: let "required" handle it
    if (!control.value) {
      return null;
    }

    // The value is a 'YYYY-MM-DD' string (what <input type="date"> gives).
    // Build a local date from its parts: new Date('YYYY-MM-DD') would read it as UTC midnight,
    // which can be the day before in your timezone.
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(control.value);
    if (!match) {
      return { birthdate: true };
    }
    const birthdate = new Date(+match[1], +match[2] - 1, +match[3]);
    if (birthdate.getMonth() !== +match[2] - 1) {
      return { birthdate: true }; // not a real date, e.g. '2001-02-30'
    }
    const today = new Date();

    // A birthdate in the future is not valid
    if (birthdate > today) {
      return { birthdate: true };
    }

    // Calculate the age
    let age = today.getFullYear() - birthdate.getFullYear();
    const birthdayNotPassedYet =
      today.getMonth() < birthdate.getMonth() ||
      (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate());

    if (birthdayNotPassedYet) {
      age = age - 1;
    }

    if (age < this.minAge || age > this.maxAge) {
      return { birthdate: true }; // invalid
    }

    return null; // valid
  }
}
