```ts auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

// logged in → open, else → login + ?returnUrl
export const authGuard: CanActivateFn = (_route, state) => {
    const auth = inject(AuthService);
    if (auth.currentUser()) return true;

    return inject(Router).createUrlTree(['/auth/auth-service'], {
        queryParams: { returnUrl: state.url },
    });
};
```

```ts auth.routes.ts
// pages/auth/auth.routes.ts → /auth/...
// NOT protected (loop)
export const routes: Routes = [
    {
        path: 'auth-service',
        loadComponent: () =>
            import('./auth-service/auth-service.component').then((m) => m.AuthServiceComponent),
    },
];
```

```ts service.routes.ts
// pages/services/service.routes.ts → /service/...
export const routes: Routes = [
    {
        // protects every child
        path: '',
        canActivate: [authGuard],
        // re-run on same URL
        runGuardsAndResolvers: 'always',
        children: [
            {
                path: 'get-all',
                loadComponent: () =>
                    import('./get-all/get-all.component').then((m) => m.GetAllComponent),
            },
        ],
    },
];
```

```ts auth-service.component.ts
export class AuthServiceComponent {
    protected readonly auth = inject(AuthService);
    private readonly _router = inject(Router);

    // ?returnUrl, set by the guard
    readonly returnUrl = input<string>();

    constructor() {
        // logged in → go back
        effect(() => {
            const url = this.returnUrl();
            if (this.auth.currentUser() && url) this._router.navigateByUrl(url);
        });
    }
}
```
