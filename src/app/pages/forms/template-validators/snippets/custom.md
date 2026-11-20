```ts strong-password.directive.ts
import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
    selector: '[appStrongPassword]',
    // multi: true!
    providers: [{ provide: NG_VALIDATORS, useExisting: StrongPasswordDirective, multi: true }],
})
export class StrongPasswordDirective implements Validator {
    validate(control: AbstractControl): ValidationErrors | null {
        const password: string = control.value;
        if (!password) return null; // empty: required's job

        const isLongEnough = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (isLongEnough && hasUppercase && hasLowercase && hasNumber) return null;
        return { strongPassword: true };
    }
}
```

```ts birthday.directive.ts
@Directive({
    selector: '[appBirthdate]',
    providers: [{ provide: NG_VALIDATORS, useExisting: BirthdateDirective, multi: true }],
})
export class BirthdateDirective implements Validator {
    // parameters
    @Input() minAge = 0;
    @Input() maxAge = 135;

    validate(control: AbstractControl): ValidationErrors | null {
        if (!control.value) return null;
        // ...'YYYY-MM-DD' → age
        if (age < this.minAge || age > this.maxAge) return { birthdate: true };
        return null;
    }
}
```

```ts template-validators.component.ts
@Component({
  // each directive!
  imports: [FormsModule, StrongPasswordDirective, BirthdateDirective],
  ...
})
export class TemplateValidatorsComponent {
  custom = { password: '', birthdate: '' };
}
```

```html template-validators.component.html
<input
    name="password"
    type="password"
    class="form-control"
    [(ngModel)]="custom.password"
    #passwordCtrl="ngModel"
    required
    appStrongPassword
/>
@if (passwordCtrl.touched && passwordCtrl.errors?.['strongPassword']) {
<div class="invalid-feedback">8+ characters, an uppercase, a lowercase and a digit</div>
}

<!-- with parameters -->
<input
    name="birthdate"
    type="date"
    class="form-control"
    [(ngModel)]="custom.birthdate"
    #birthdateCtrl="ngModel"
    required
    appBirthdate
    [minAge]="18"
    [maxAge]="120"
/>
@if (birthdateCtrl.touched && birthdateCtrl.errors?.['birthdate']) {
<div class="invalid-feedback">You must be 18 to 120 years old</div>
}
```
