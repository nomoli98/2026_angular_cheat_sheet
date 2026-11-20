import { Directive } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  NG_ASYNC_VALIDATORS,
  ValidationErrors,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { emailTakenValidator } from '../reactive-form/email-taken.validator';

/**
 * Async check: is the email already in the fake API?
 *
 * Usage: <input name="email" [(ngModel)]="..." required email appEmailTaken />
 */
@Directive({
  selector: '[appEmailTaken]',
  providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: EmailTakenDirective, multi: true }],
})
export class EmailTakenDirective implements AsyncValidator {
  private readonly _validator = emailTakenValidator(); // reuses the reactive one

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this._validator(control) as Observable<ValidationErrors | null>;
  }
}
