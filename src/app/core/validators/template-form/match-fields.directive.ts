import { Directive, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { matchFieldsValidator } from '../reactive-form/match-fields.validator';

/**
 * Cross-field check. Put it on the <form>.
 *
 * Usage: <form #form="ngForm" [appMatchFields]="['password', 'confirmPassword']">
 */
@Directive({
  selector: '[appMatchFields]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MatchFieldsDirective, multi: true }],
})
export class MatchFieldsDirective implements Validator {
  readonly fields = input<[string, string]>(undefined, { alias: 'appMatchFields' }); // optional: NG0950

  validate(group: AbstractControl): ValidationErrors | null {
    const fields = this.fields();
    if (!fields) return null; // runs before inputs
    const [field, confirmField] = fields;
    return matchFieldsValidator(field, confirmField)(group);
  }
}
