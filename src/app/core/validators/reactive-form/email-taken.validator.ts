import { inject } from '@angular/core';
import { AsyncValidatorFn } from '@angular/forms';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { UserService } from '@core/services/user.service';

// async validator. ⚠️ uses inject(): field initializer or constructor
export function emailTakenValidator(): AsyncValidatorFn {
    const userService = inject(UserService);

    return (control) => {
        if (!control.value) return of(null); // empty: required handles it

        // wait 400 ms: typing again cancels it → 1 request
        return timer(400).pipe(
            switchMap(() => userService.emailExists(control.value)),
            map((taken) => (taken ? { emailTaken: true } : null)),
            catchError(() => of(null)), // API down: don't block
        );
    };
}
