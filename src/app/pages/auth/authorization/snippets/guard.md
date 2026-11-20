```ts admin.guard.ts
// core/guards/admin.guard.ts
export const adminGuard: CanActivateFn = (_route, state) => {
    const user = inject(AuthService).currentUser();
    if (isAdmin(user)) return true; // ✅ open

    const router = inject(Router);
    if (!user) {
        // logged out → login
        return router.createUrlTree(['/auth/auth-service'], {
            queryParams: { returnUrl: state.url },
        });
    }
    // not admin → explain why
    return router.createUrlTree(['/auth/authorization'], { queryParams: { forbidden: state.url } });
};
```

```ts auth.routes.ts
// pages/auth/auth.routes.ts
{
  path: 'authorization/admin-area',
  canActivate: [adminGuard],
  runGuardsAndResolvers: 'always', // re-run on toggle
  loadComponent: () => import('./authorization/admin-area/admin-area.component')
    .then((m) => m.AdminAreaComponent),
},

// protect a whole group
{
  path: 'admin',
  canActivate: [authGuard, adminGuard], // in order
  runGuardsAndResolvers: 'always',
  children: [ /* every admin page */ ],
},
```

```ts authorization.component.ts
// ?forbidden → input()
readonly forbidden = input<string>();
```

```ts admin.guard.spec.ts
const runGuard = () =>
    TestBed.runInInjectionContext(() =>
        adminGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );

it('sends a simple user to the authorization page', () => {
    currentUser.set(alice);
    expect((runGuard() as UrlTree).toString()).toBe(
        '/auth/authorization?forbidden=%2Fauth%2Fauthorization%2Fadmin-area',
    );
});
```
