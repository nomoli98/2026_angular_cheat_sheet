import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/**
 * Checks that the value is one of the allowed values in a list.
 *
 * Usage: <input type="radio" name="subscription" [(ngModel)]="..." [appInList]="['free', 'premium']" />
 */
@Directive({
  selector: '[appInList]',
  providers: [{ provide: NG_VALIDATORS, useExisting: InListDirective, multi: true }],
})
export class InListDirective implements Validator {
  @Input() appInList: string[] = []; // the allowed values

  validate(control: AbstractControl): ValidationErrors | null {
    // Empty field: let "required" handle it
    if (!control.value) {
      return null;
    }

    if (this.appInList.includes(control.value)) {
      return null; // valid
    }

    return { inList: true }; // invalid
  }
}
