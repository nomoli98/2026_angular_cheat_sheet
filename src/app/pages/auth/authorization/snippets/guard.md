```ts admin.guard.ts
// core/guards/admin.guard.ts
export const adminGuard: CanActivateFn = (_route, state) => {
  const user = inject(AuthService).currentUser();
  if (isAdmin(user)) return true; // ✅ open the page

  const router = inject(Router);
  if (!user) {
    // nobody logged in → log in first, then come back
    return router.createUrlTree(['/auth/auth-service'], { queryParams: { returnUrl: state.url } });
  }
  // logged in, but not admin → somewhere that explains why
  return router.createUrlTree(['/auth/authorization'], { queryParams: { forbidden: state.url } });
};
```

```ts auth.routes.ts
// pages/auth/auth.routes.ts
{
  path: 'authorization/admin-area',
  canActivate: [adminGuard],
  runGuardsAndResolvers: 'always', // re-run when the Admin toggle reloads the same URL
  loadComponent: () => import('./authorization/admin-area/admin-area.component')
    .then((m) => m.AdminAreaComponent),
},

// Protect a whole group: put it on the parent
{
  path: 'admin',
  canActivate: [authGuard, adminGuard], // run in order: logged in? then admin?
  runGuardsAndResolvers: 'always',
  children: [ /* every admin page */ ],
},
```

```ts authorization.component.ts
// The page the guard sends to reads ?forbidden=... as an input()
// (withComponentInputBinding() in app.config.ts)
readonly forbidden = input<string>();
```

```ts admin.guard.spec.ts
const runGuard = () =>
  TestBed.runInInjectionContext(() =>
    adminGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
  );

it('sends a simple user to the authorization page', () => {
  currentUser.set(alice);
  expect((runGuard() as UrlTree).toString())
    .toBe('/auth/authorization?forbidden=%2Fauth%2Fauthorization%2Fadmin-area');
});
```
