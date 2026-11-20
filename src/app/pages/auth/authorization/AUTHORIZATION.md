# Authorization: roles, `isAdmin`, admin guard, server check

> 📖 **Official docs:** [Route guards](https://angular.dev/guide/routing/route-guards) · [`CanActivateFn`](https://angular.dev/api/router/CanActivateFn) · [`computed()`](https://angular.dev/guide/signals#computed-signals) · [MDN: 401 vs 403](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403)

Demo pages: `/auth/authorization` (everything below, live), `/auth/authorization/admin-area` (admins only)

| Word               | Question                      | Answered by                                 | Fails with             |
| ------------------ | ----------------------------- | ------------------------------------------- | ---------------------- |
| **Authentication** | _who are you?_                | login, `AuthService.currentUser()`, a token | `unauthorized` / `401` |
| **Authorization**  | _are you allowed to do this?_ | the **role** (`admin` / `user`) + a rule    | `forbidden` / `403`    |

```
Template ──▶ Component ──▶ Controller ──▶ Service ──HTTP──▶ Server
@if/[disabled]  if (!_isAdmin())  isAdmin + deny            token + role check
  comfort         comfort        the app's ONE place          ✅ the real security
```

> ⚠️ Every check in the browser can be bypassed (DevTools, curl...). They are for a **good UX** and **no useless requests**. Only the **server** protects the data.

---

## 1. The rules in this repo

| `UserController`             | Allowed                                         |
| ---------------------------- | ----------------------------------------------- |
| `getAll()`                   | admin                                           |
| `getOne(id)`                 | admin                                           |
| `getMe()`                    | **anybody logged in** (reads their own account) |
| `create(request)`            | admin                                           |
| `updateFully(id, request)`   | admin                                           |
| `updatePartial(id, changes)` | admin                                           |
| `delete(id)`                 | admin                                           |

| Account                                                                  | Role    |
| ------------------------------------------------------------------------ | ------- |
| Bob (`bob@email.bob` / `BobIsTheBest99#`)                                | `admin` |
| Alice (`alice.dupont@mail.com` / `AliceIsTheBest99#`) and everybody else | `user`  |

---

## 2. Step by step

### Step 1. A role on the user

```ts
// core/enums/role.enum.ts
export enum RoleEnum {
    ADMIN = 'admin',
    USER = 'user',
}
```

Add `role: RoleEnum` to `UserEntity`, `UserResponse`, the mapper, and `"role": "admin"` / `"user"` in `db.json`. New accounts always get `RoleEnum.USER` (the **service** sets it: a user must never choose their own role).

### Step 2. The helpers (`core/controllers/permissions.ts`)

```ts
type WithRole = Pick<UserResponse, 'id' | 'role'>; // a UserResponse OR the user read from a JWT

export function isAdmin(user: WithRole | null): boolean {
    return user?.role === RoleEnum.ADMIN; // null (logged out) → false
}

export function deny(user: WithRole | null): never {
    throw new Error(user ? 'forbidden' : 'unauthorized');
}
```

| Helper                    | Use it for                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `isAdmin(user)`           | admin only                                                                           |
| `isAdminOrSelf(user, id)` | "admin, or your own data" (kept as an example, not used by `UserController` anymore) |
| `deny(user)`              | throw `unauthorized` (nobody) or `forbidden` (wrong role)                            |

New rule? One more helper: `isPremium(user) { return user?.subscription === 'premium'; }`.

### Step 3. The controller checks (`core/controllers/user.controller.ts`)

```ts
async delete(id: number): Promise<void> {
  const user = this._authService.currentUser(); // 1. who?
  if (!isAdmin(user)) deny(user);               // 2. allowed? no → rejected Promise
  await firstValueFrom(this._userService.delete(id), { defaultValue: undefined }); // 3. go
}

// the only exception
async getMe(): Promise<UserResponse> {
  const user = this._authService.currentUser();
  if (!user) deny(user);                                    // logged in is enough
  return firstValueFrom(this._userService.getOne(user.id)); // the id comes from the login, not from outside
}
```

> 💡 Why `getMe()` and not `getOne(myId)`? `getOne` takes **any** id, so it needs a role check. `getMe` can only ever read **yourself**: no id to cheat with.

### Step 4. The component checks too (`pages/services/*`)

```ts
private readonly _authService = inject(AuthService);
protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));

async onClick() {
  this._error.set(null);
  // 1. not admin → don't even call the controller
  if (!this._isAdmin()) {
    this._error.set('forbidden: only an admin can see the list of users');
    return;
  }
  try {
    // 2. the controller checks AGAIN (a page can forget its check, the controller can't be skipped)
    this._users.set(await this._userController.getAll());
  } catch (err) {
    this._error.set((err as Error).message);
  }
}
```

- `computed()`: re-runs by itself when `currentUser()` changes (login, logout, the **Admin** toggle).
- A method with **two clicks** (delete: _Delete_ → _Yes, delete_) checks again on the second click: the role may have changed in between.

### Step 5. The template shows / hides

```html
@if (!_isAdmin()) {
<div class="alert alert-warning">Only an admin can do this.</div>
}

<button (click)="onClick()" [disabled]="!_isAdmin()">Get All Users</button>

<!-- hide data already loaded if the user stops being admin -->
@if (_isAdmin()) { @for (u of _users(); track u.id) {
<li>{{ u.name }}</li>
} }
```

> 💡 Write `!_isAdmin()` (call the signal). `!_isAdmin` (no `()`) is always `false`: a function is "truthy".

### Step 6. A route guard for admin pages (`core/guards/admin.guard.ts`)

```ts
export const adminGuard: CanActivateFn = (_route, state) => {
    const user = inject(AuthService).currentUser();
    if (isAdmin(user)) return true;

    const router = inject(Router);
    if (!user) {
        return router.createUrlTree(['/auth/auth-service'], {
            queryParams: { returnUrl: state.url },
        });
    }
    return router.createUrlTree(['/auth/authorization'], { queryParams: { forbidden: state.url } });
};
```

```ts
// pages/auth/auth.routes.ts
{
  path: 'authorization/admin-area',
  canActivate: [adminGuard],
  runGuardsAndResolvers: 'always', // so the Admin toggle can kick you out
  loadComponent: () => import('./authorization/admin-area/admin-area.component').then((m) => m.AdminAreaComponent),
},
```

| Guard        | Asks       | No →                                                                           |
| ------------ | ---------- | ------------------------------------------------------------------------------ |
| `authGuard`  | logged in? | `/auth/auth-service?returnUrl=...`                                             |
| `adminGuard` | admin?     | logged out → same as above · simple user → `/auth/authorization?forbidden=...` |

Protect a whole group: `canActivate: [authGuard, adminGuard]` on a parent with `children` (they run **in order**).

> ⚠️ The CRUD pages (`/service/*`) only use `authGuard`, **not** `adminGuard`, on purpose: a simple user can open them and see _why_ the buttons are disabled. In a real app you'd usually put `adminGuard` on admin pages.

> ⚠️ Never redirect a forbidden user to the page that sent them (or to a page with the same guard): infinite loop.

### Step 7. The server checks (the real security, `fake-api/auth-server.js`)

```js
async function users(headers) {
    const [user, error] = await authenticate(headers); // 401: no / bad / expired token
    if (error) return error;
    if (user.role !== 'admin') return [403, { message: 'forbidden' }]; // 403: wrong role
    return [200, (await data('')).map(withoutPassword)];
}
```

| Request            | Header        | Answer                        |
| ------------------ | ------------- | ----------------------------- |
| `GET /token/users` | none          | `401 no token`                |
| `GET /token/users` | Alice's token | `403 forbidden`               |
| `GET /token/users` | Bob's token   | `200` the users, no passwords |

`authenticate()` reads the role from the **database**, not from the token: if an admin is demoted, it counts right away (the token keeps the old role until it expires).

Angular side:

```ts
// TokenAuthService
getUsers(): Observable<UserResponse[]> {
  return this._http.get<UserResponse[]>(`${this._url}/users`); // tokenInterceptor adds the Bearer token
}

// TokenAuthController: checked here too (no useless request), but the server decides
async getUsers(): Promise<UserResponse[]> {
  const user = this._authService.currentUser();
  if (!isAdmin(user)) deny(user);
  return firstValueFrom(this._authService.getUsers());
}
```

> 💡 The demo page has a button that **skips** the Angular check: you then see the `403` coming from the server, like with curl.

> 💡 The interceptor logs you out on a `401` (your token is dead) but **not** on a `403` (your token is fine, you're just not allowed).

---

## 3. The Admin toggle (navbar)

Two switches: **logged in** (on/off) and **Admin** (Bob ↔ Alice). Both are real logins through the API.

| Switch    | On                             | Off            | Saved in `localStorage`           |
| --------- | ------------------------------ | -------------- | --------------------------------- |
| logged in | log in with the chosen account | logout         | `auth-toggle`: `'on'` / `'off'`   |
| Admin     | Bob (`admin`)                  | Alice (`user`) | `auth-role`: `'admin'` / `'user'` |

```ts
// shared/auth-toggle/auth-toggle.service.ts
async setRole(role: RoleEnum): Promise<void> {
  this._role.set(role);
  this._save(ROLE_KEY, role);
  if (!this.isOn()) return;  // logged out: remember for the next login
  await this._login();       // AuthService.login(ACCOUNTS[role])
  await this._rerunGuards(); // navigateByUrl(sameUrl, { onSameUrlNavigation: 'reload' })
}
```

The Admin switch is disabled while logged out. The badge next to the name shows the role the **API** answered, not what the switch says.

---

## 4. Test it

```ts
// controller: a fake AuthService = a signal the test sets
it('a user cannot delete an account, not even their own', async () => {
    currentUser.set(alice);
    await expect(controller.delete(2)).rejects.toThrow('forbidden');
    expect(fakeUserService.delete).not.toHaveBeenCalled();
});

// guard: run it in an injection context
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

Full examples: `core/controllers/user.controller.spec.ts`, `core/guards/admin.guard.spec.ts`, `shared/auth-toggle/auth-toggle.service.spec.ts`.

E2E: start as Alice with `page.addInitScript(() => localStorage.setItem('auth-role', 'user'))` before `page.goto(...)`.

---

## 🐛 Troubleshooting

### The button stays enabled for Alice

- `[disabled]="!_isAdmin"` without `()`: always enabled. Call it: `!_isAdmin()`.
- `_isAdmin` is a plain `boolean` set once in the constructor: it never updates. Use `computed()`.

### Bob gets `forbidden`

- `db.json` from before the roles: run `npm run api:reset`.
- The **Admin** switch is off: you're logged in as Alice (look at the badge in the navbar).

### I switched Admin off on the admin area and nothing happened

The route needs `runGuardsAndResolvers: 'always'`, and the toggle must navigate to the same URL with `onSameUrlNavigation: 'reload'`. Without both, the guard doesn't run again.

### `NG0203: inject() must be called from an injection context` in the guard test

Call it inside `TestBed.runInInjectionContext(() => adminGuard(...))`.

### `GET /token/users` → `404 not found`

The auth server is the old one: restart `npm run dev` (the route was added in `fake-api/auth-server.js`).

### `GET /token/users` → `403` for Bob

Bob's role in `securePeople` (not `people`) must be `"admin"`. `npm run api:reset` puts it back.

### `forbidden` vs `unauthorized`: which is which?

`unauthorized` (401) = I don't know who you are → log in. `forbidden` (403) = I know who you are, and the answer is no → logging in again as the same user won't help.
