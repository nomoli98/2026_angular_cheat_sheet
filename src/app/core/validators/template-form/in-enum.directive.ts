import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/** Value must be in the enum: [appInEnum]="GenderEnum" */
@Directive({
  selector: '[appInEnum]',
  providers: [{ provide: NG_VALIDATORS, useExisting: InEnumDirective, multi: true }],
})
export class InEnumDirective implements Validator {
  @Input() appInEnum: object = {}; // the enum

  validate(control: AbstractControl): ValidationErrors | null {
    // empty: required handles it
    if (!control.value) {
      return null;
    }

    const allowedValues = Object.values(this.appInEnum);

    if (allowedValues.includes(control.value)) {
      return null;
    }

    return { inEnum: true };
  }
}
