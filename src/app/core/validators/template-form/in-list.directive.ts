import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/** Value must be in the list: [appInList]="['free', 'premium']" */
@Directive({
    selector: '[appInList]',
    providers: [{ provide: NG_VALIDATORS, useExisting: InListDirective, multi: true }],
})
export class InListDirective implements Validator {
    @Input() appInList: string[] = []; // allowed values

    validate(control: AbstractControl): ValidationErrors | null {
        // empty: required handles it
        if (!control.value) {
            return null;
        }

        if (this.appInList.includes(control.value)) {
            return null;
        }

        return { inList: true };
    }
}
