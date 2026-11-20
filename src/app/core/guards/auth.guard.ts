import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

// Route guard: runs BEFORE Angular opens the page.
// - logged in → true: the page opens
// - not logged in → a UrlTree: Angular goes to the auth page instead,
//   with ?returnUrl=... so we can come back here after logging in
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.currentUser()) return true;

  return inject(Router).createUrlTree(['/auth/auth-service'], {
    queryParams: { returnUrl: state.url },
  });
};
