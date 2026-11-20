import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { isAdmin } from '@core/controllers/permissions';

// Route guard for ADMIN pages: runs BEFORE Angular opens the page.
// - admin           → true: the page opens
// - nobody logged in → the auth page, with ?returnUrl=... (like authGuard)
// - simple user      → the authorization page, with ?forbidden=... to say what was blocked
//
// ⚠️ It only hides a PAGE. The data behind it must still be protected by the controller
// (and, for real, by the server): see pages/auth/authorization/AUTHORIZATION.md
export const adminGuard: CanActivateFn = (_route, state) => {
  const user = inject(AuthService).currentUser();
  if (isAdmin(user)) return true;

  const router = inject(Router);
  if (!user) {
    return router.createUrlTree(['/auth/auth-service'], { queryParams: { returnUrl: state.url } });
  }
  return router.createUrlTree(['/auth/authorization'], { queryParams: { forbidden: state.url } });
};
