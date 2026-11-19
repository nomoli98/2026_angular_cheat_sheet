import { inject } from '@angular/core';
import { AsyncValidatorFn } from '@angular/forms';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { UserService } from '@core/services/user.service';

// ASYNC validator: returns an Observable of the errors (or null) instead of the errors directly.
// ⚠️ Uses inject(), so call it where inject() works: a field initializer or the constructor.
export function emailTakenValidator(): AsyncValidatorFn {
  const userService = inject(UserService);

  return (control) => {
    if (!control.value) return of(null); // empty: let Validators.required handle it

    // Wait 400 ms before asking the API. If the user types again, Angular cancels this
    // Observable and starts a new one → only 1 request when the user stops typing.
    return timer(400).pipe(
      switchMap(() => userService.emailExists(control.value)),
      map((taken) => (taken ? { emailTaken: true } : null)),
      catchError(() => of(null)), // API down: don't block the form
    );
  };
}
