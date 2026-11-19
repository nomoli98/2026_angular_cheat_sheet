```ts auth.guard.ts
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

  return inject(Router).createUrlTree(['/service/auth-service'], {
    queryParams: { returnUrl: state.url },
  });
};
```

```ts service.routes.ts
export const routes: Routes = [
  {
    // NOT protected: the page the guard sends you to
    path: 'auth-service',
    loadComponent: () =>
      import('./auth-service/auth-service.component').then((m) => m.AuthServiceComponent),
  },
  {
    // Every page in `children` is protected: the guard runs before any of them opens
    path: '',
    canActivate: [authGuard],
    // re-run the guard on EVERY navigation, even to the same URL (when the toggle turns off)
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: 'get-all',
        loadComponent: () => import('./get-all/get-all.component').then((m) => m.GetAllComponent),
      },
    ],
  },
];
```

```ts auth-service.component.ts
export class AuthServiceComponent {
  protected readonly auth = inject(AuthService);
  private readonly _router = inject(Router);

  // ?returnUrl=/service/get-all, given by the guard (withComponentInputBinding → input())
  readonly returnUrl = input<string>();

  constructor() {
    // As soon as someone is logged in, go back to the page the guard blocked
    effect(() => {
      const url = this.returnUrl();
      if (this.auth.currentUser() && url) this._router.navigateByUrl(url);
    });
  }
}
```
