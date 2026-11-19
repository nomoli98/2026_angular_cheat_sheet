import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/**
 * Checks that the value is one of the values of an enum.
 *
 * Usage: <select name="gender" [(ngModel)]="..." [appInEnum]="GenderEnum">
 */
@Directive({
  selector: '[appInEnum]',
  providers: [{ provide: NG_VALIDATORS, useExisting: InEnumDirective, multi: true }],
})
export class InEnumDirective implements Validator {
  @Input() appInEnum: object = {}; // the enum to check against

  validate(control: AbstractControl): ValidationErrors | null {
    // Empty field: let "required" handle it
    if (!control.value) {
      return null;
    }

    const allowedValues = Object.values(this.appInEnum);

    if (allowedValues.includes(control.value)) {
      return null; // valid
    }

    return { inEnum: true }; // invalid
  }
}
