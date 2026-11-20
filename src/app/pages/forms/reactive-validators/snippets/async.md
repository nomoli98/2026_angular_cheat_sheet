```ts email-taken.validator.ts
import { inject } from '@angular/core';
import { AsyncValidatorFn } from '@angular/forms';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { UserService } from '@core/services/user.service';

// returns an Observable
export function emailTakenValidator(): AsyncValidatorFn {
  const userService = inject(UserService); // injection context only

  return (control) => {
    if (!control.value) return of(null);

    return timer(400).pipe( // free debounce
      switchMap(() => userService.emailExists(control.value)),
      map((taken) => (taken ? { emailTaken: true } : null)),
      catchError(() => of(null)), // API down = valid
    );
  };
}
```

```ts reactive-validators.component.ts
asyncForm = new FormGroup({
  email: new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
    asyncValidators: [emailTakenValidator()], // separate key
  }),
});
```

```html reactive-validators.component.html
@let email = asyncForm.controls.email;
<input type="email" class="form-control" formControlName="email"
       [class.is-invalid]="email.invalid && email.touched" />

<!-- while waiting -->
@if (email.pending) { <div class="form-text">Checking the email...</div> }

@if (email.touched && email.hasError('emailTaken')) {
  <div class="invalid-feedback">This email is already taken</div>
}
```
