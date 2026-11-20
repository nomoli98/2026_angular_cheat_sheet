import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { isAdmin } from '@core/controllers/permissions';

// admin → open, logged out → ?returnUrl, user → ?forbidden (hides the page, not the data)
export const adminGuard: CanActivateFn = (_route, state) => {
  const user = inject(AuthService).currentUser();
  if (isAdmin(user)) return true;

  const router = inject(Router);
  if (!user) {
    return router.createUrlTree(['/auth/auth-service'], { queryParams: { returnUrl: state.url } });
  }
  return router.createUrlTree(['/auth/authorization'], { queryParams: { forbidden: state.url } });
};
