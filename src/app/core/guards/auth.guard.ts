import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

// logged in → open, otherwise → auth page with ?returnUrl
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.currentUser()) return true;

  return inject(Router).createUrlTree(['/auth/auth-service'], {
    queryParams: { returnUrl: state.url },
  });
};
