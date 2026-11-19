# Auth service, route guard and the auth toggle

> 📖 **Official docs:** [Route guards](https://angular.dev/guide/routing/route-guards) · [`CanActivateFn`](https://angular.dev/api/router/CanActivateFn) · [`provideAppInitializer`](https://angular.dev/api/core/provideAppInitializer) · [Bootstrap switches](https://getbootstrap.com/docs/5.3/forms/checks-radios/#switches)

Demo page: `/service/auth-service` (the guard sends you there when nobody is logged in)

Three pieces work together:

| Piece | File | Job |
| ----- | ---- | --- |
| **AuthService** | `core/services/auth.service.ts` | knows **who is logged in**: `currentUser()` signal, `login()`, `logout()` |
| **Route guard** | `core/guards/auth.guard.ts` | runs **before** a page opens: logged in → open it, otherwise → redirect |
| **Auth toggle** | `shared/auth-toggle/` | the switch in the navbar: on = log in as Bob, off = log out (a demo helper, like a theme toggle) |

```
toggle off → AuthService.logout() → currentUser() = null
           → guard runs again on the current page → /service/auth-service?returnUrl=/service/get-all
toggle on  → AuthService.login(Bob) → currentUser() = Bob
           → the auth page sees a returnUrl → back to /service/get-all
```

---

## 1. AuthService: who is logged in

```ts
@Service()
export class AuthService {
  private readonly _currentUser = signal<UserResponse | null>(null);
  readonly currentUser = this._currentUser.asReadonly(); // read-only outside

  login(request: LoginRequest): Observable<UserResponse> {
    return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
      map((users) => {
        const user = users[0];
        if (!user || user.password !== request.password) throw new Error('bad credentials');
        return UserMapper(user);
      }),
      tap((user) => this._currentUser.set(user)), // 👈 remember who is logged in
    );
  }

  logout(): void {
    this._currentUser.set(null);
  }
}
```

Everything else just **reads** `currentUser()`: the controllers (permissions), the guard, the toggle, the templates.

> ⚠️ `currentUser` lives in memory: a page refresh empties it. That's why the toggle logs in again on start (section 3).

---

## 2. The route guard

### 2.1 Write it

A guard is a **function** the router calls before opening a page.

```ts
// core/guards/auth.guard.ts
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService); // inject() works inside a guard
  if (auth.currentUser()) return true; // ✅ open the page

  // ❌ go somewhere else instead, and remember where the user wanted to go
  return inject(Router).createUrlTree(['/service/auth-service'], {
    queryParams: { returnUrl: state.url },
  });
};
```

| The guard returns | What happens |
| ----------------- | ------------ |
| `true` | the page opens |
| `false` | nothing happens, you stay where you are (bad UX: the user doesn't know why) |
| a `UrlTree` (`router.createUrlTree([...])`) | Angular goes **there** instead ✅ |
| a `Promise` / `Observable` of one of those | Angular waits for it (e.g. to ask the API) |

> 💡 `state.url` = the URL the user wanted (`/service/get-all`). `route` = the route being opened (its params, data...).

### 2.2 Protect pages with it

```ts
// pages/services/service.routes.ts
export const routes: Routes = [
  {
    // NOT protected: the page the guard sends you to (protecting it would loop forever)
    path: 'auth-service',
    loadComponent: () => import('./auth-service/auth-service.component').then((m) => m.AuthServiceComponent),
  },
  {
    path: '',                         // a parent with no URL of its own...
    canActivate: [authGuard],         // ...protects all its children at once
    runGuardsAndResolvers: 'always',  // re-run the guard even when the URL doesn't change
    children: [
      { path: 'get-all', loadComponent: () => import('./get-all/get-all.component').then((m) => m.GetAllComponent) },
      // add new protected pages here
    ],
  },
];
```

| Option | Use it for |
| ------ | ---------- |
| `canActivate: [guard]` | protect this route (and so everything under it) |
| `canActivateChild: [guard]` | run the guard for each child **change** (not re-run on a same-URL reload, see troubleshooting) |
| `canMatch: [guard]` | the route is **skipped** when the guard says no (the next matching route is tried, e.g. the 404) |
| `canDeactivate: [guard]` | leaving the page ("you have unsaved changes") |
| `runGuardsAndResolvers: 'always'` | re-run the guard on every navigation, even to the same URL |

### 2.3 Come back after login: `returnUrl`

The guard adds `?returnUrl=/service/get-all`. Thanks to `withComponentInputBinding()` (in `app.config.ts`), query params land in `input()`s:

```ts
export class AuthServiceComponent {
  protected readonly auth = inject(AuthService);
  private readonly _router = inject(Router);

  readonly returnUrl = input<string>(); // ← ?returnUrl=...

  constructor() {
    // As soon as someone is logged in, go back to the page the guard blocked
    effect(() => {
      const url = this.returnUrl();
      if (this.auth.currentUser() && url) this._router.navigateByUrl(url);
    });
  }
}
```

> ⚠️ Only use `returnUrl` with `navigateByUrl` for **your own** paths (starting with `/`). Never put it in `window.location`: someone could send a link with `?returnUrl=https://evil.site`.

---

## 3. The auth toggle (demo helper)

A switch in the navbar, like a theme toggle. **On by default**, so the protected pages work right away.

| | On | Off |
| - | -- | --- |
| What it does | `AuthService.login(Bob)`: a **real** request to json-server | `AuthService.logout()` + re-runs the guard of the current page |
| Label | `Logged in as Bob Martin (admin)` | `Logged out` |
| `/service/*` pages | open | redirect to `/service/auth-service` |
| Saved in `localStorage` (`auth-toggle`) | `'on'` | `'off'` |

### 3.1 Log in again when the app starts

```ts
// app.config.ts
providers: [
  // ...
  provideAppInitializer(() => inject(AuthToggleService).init()),
],
```

`provideAppInitializer` runs **before the first page opens**, and Angular waits if it returns a Promise. So on a refresh of `/service/get-all`, Bob is logged in again **before** the guard runs.

```ts
async init(): Promise<void> {
  if (this._read() !== 'off') await this._login(); // nothing saved = 'on' (default)
}
```

### 3.2 Turning it off on a protected page

The guard only runs when you **navigate**. Turning the toggle off doesn't navigate, so the toggle navigates to the **same URL** on purpose:

```ts
this._auth.logout();
await this._router.navigateByUrl(this._router.url, { onSameUrlNavigation: 'reload' });
```

`onSameUrlNavigation: 'reload'` + `runGuardsAndResolvers: 'always'` (on the route) → the guard runs again → redirect.

### 3.3 `localStorage`, safely

```ts
private _read(): string | null {
  try {
    return localStorage.getItem('auth-toggle');
  } catch {
    return null; // blocked (private mode, sandbox...): never crash for a preference
  }
}
```

---

## 4. Test it

### The guard

A guard uses `inject()`, so run it inside `TestBed.runInInjectionContext`:

```ts
const currentUser = signal<UserResponse | null>(null);

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [{ provide: AuthService, useValue: { currentUser } }],
  });
});

const runGuard = (url: string) =>
  TestBed.runInInjectionContext(() =>
    authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
  );

it('lets a logged-in user in', () => {
  currentUser.set(bob);
  expect(runGuard('/service/get-all')).toBe(true);
});

it('sends a logged-out user to the auth page', () => {
  const result = runGuard('/service/get-all') as UrlTree;
  expect(result.toString()).toBe('/service/auth-service?returnUrl=%2Fservice%2Fget-all');
});
```

### E2E: start logged out

The toggle logs Bob in by default. To test the login form, set the toggle **before** the app starts:

```ts
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('auth-toggle', 'off'));
  await page.goto('/tests/e2e-test');
});
```

Full examples: `core/guards/auth.guard.spec.ts`, `shared/auth-toggle/auth-toggle.service.spec.ts`, `e2e/login.spec.ts`.

---

## 🐛 Troubleshooting

### The toggle says `Login failed` / the auth page says "The API is not running"

json-server isn't running. Use `npm run dev` (not `npm start`), then turn the toggle off and on.

### I turned the toggle off but I'm still on the protected page

The guard didn't run again. Check both: `runGuardsAndResolvers: 'always'` on the **parent** route with `canActivate`, and `navigateByUrl(url, { onSameUrlNavigation: 'reload' })` after the logout. With `canActivateChild` it doesn't work: the child route didn't change, so its check is skipped.

### Infinite redirect / the page never loads

The page the guard redirects to is protected too. Keep `auth-service` **outside** the guarded `children`.

### `returnUrl` is `undefined` in the component

`withComponentInputBinding()` is missing in `provideRouter(...)` (`app.config.ts`), or the input name doesn't match the query param (`returnUrl` vs `?returnURL=`).

### The login form (unit-test page) shows "Welcome, Bob Martin!" instead of the form

Normal: the toggle logged Bob in. Click "Log out" in the form, or turn the toggle off.

### `NG0203: inject() must be called from an injection context` in a guard test

Call the guard inside `TestBed.runInInjectionContext(() => authGuard(...))`.
