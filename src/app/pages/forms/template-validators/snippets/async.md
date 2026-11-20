```ts email-taken.directive.ts
import { Directive } from '@angular/core';
import {
    AbstractControl,
    AsyncValidator,
    NG_ASYNC_VALIDATORS,
    ValidationErrors,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { emailTakenValidator } from '../reactive-form/email-taken.validator';

@Directive({
    selector: '[appEmailTaken]',
    // ASYNC token
    providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: EmailTakenDirective, multi: true }],
})
export class EmailTakenDirective implements AsyncValidator {
    private readonly _validator = emailTakenValidator(); // reuses the reactive one

    validate(control: AbstractControl): Observable<ValidationErrors | null> {
        return this._validator(control) as Observable<ValidationErrors | null>;
    }
}
```

```html template-validators.component.html
<input
    name="email"
    type="email"
    class="form-control"
    [(ngModel)]="async.email"
    #emailCtrl="ngModel"
    required
    email
    appEmailTaken
/>

<!-- while waiting -->
@if (emailCtrl.pending) {
<div class="form-text">Checking the email...</div>
} @if (emailCtrl.touched && emailCtrl.errors?.['emailTaken']) {
<div class="invalid-feedback">This email is already taken</div>
}
```
