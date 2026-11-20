import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/** Age between minAge and maxAge: <input type="date" appBirthdate [minAge]="0" [maxAge]="135" /> */
@Directive({
    selector: '[appBirthdate]',
    providers: [{ provide: NG_VALIDATORS, useExisting: BirthdateDirective, multi: true }],
})
export class BirthdateDirective implements Validator {
    @Input() minAge = 0;
    @Input() maxAge = 135;

    validate(control: AbstractControl): ValidationErrors | null {
        // empty: required handles it
        if (!control.value) {
            return null;
        }

        // 'YYYY-MM-DD' → local date (new Date(str) would be UTC)
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(control.value);
        if (!match) {
            return { birthdate: true };
        }
        const birthdate = new Date(+match[1], +match[2] - 1, +match[3]);
        if (birthdate.getMonth() !== +match[2] - 1) {
            return { birthdate: true }; // not a real date
        }
        const today = new Date();

        // no future dates
        if (birthdate > today) {
            return { birthdate: true };
        }

        let age = today.getFullYear() - birthdate.getFullYear();
        const birthdayNotPassedYet =
            today.getMonth() < birthdate.getMonth() ||
            (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate());

        if (birthdayNotPassedYet) {
            age = age - 1;
        }

        if (age < this.minAge || age > this.maxAge) {
            return { birthdate: true };
        }

        return null;
    }
}
