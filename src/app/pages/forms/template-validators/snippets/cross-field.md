```ts match-fields.directive.ts
import { Directive, input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { matchFieldsValidator } from '../reactive-form/match-fields.validator';

@Directive({
  selector: '[appMatchFields]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MatchFieldsDirective, multi: true }],
})
export class MatchFieldsDirective implements Validator {
  readonly fields = input<[string, string]>(undefined, { alias: 'appMatchFields' }); // optional: NG0950

  // group = the whole form
  validate(group: AbstractControl): ValidationErrors | null {
    const fields = this.fields();
    if (!fields) return null; // runs before inputs
    const [field, confirmField] = fields;
    return matchFieldsValidator(field, confirmField)(group); // reuses reactive one
  }
}
```

```html template-validators.component.html
<!-- directive on the form -->
<form #crossForm="ngForm" [appMatchFields]="['password', 'confirmPassword']">
  <input name="password" type="password" class="form-control" [(ngModel)]="cross.password" required />

  <input name="confirmPassword" type="password" class="form-control"
         [(ngModel)]="cross.confirmPassword" #confirmCtrl="ngModel" required />

  <!-- error on the FORM -->
  @if (confirmCtrl.touched && crossForm.hasError('fieldsMismatch')) {
    <div class="invalid-feedback">Passwords don't match</div>
  }
</form>
```
