# Controllers: check the permission, then call the service

> 📖 **Official docs:** [Services and DI](https://angular.dev/guide/di) · [RxJS `firstValueFrom`](https://rxjs.dev/api/index/function/firstValueFrom) · [MDN `async` / `await`](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Promises)

A **controller** works like a backend controller: it **checks** that the logged-in user is allowed to do the action, then **calls the service**. It returns a **Promise**, not an Observable, so the component just writes `await controller.getAll()`.

```
Component ──await──▶ Controller ──allowed?──▶ Service ──HTTP──▶ json-server
                        │          firstValueFrom(Observable) → Promise
                        │
                        └── not allowed → throw ('unauthorized' / 'forbidden')
                                          the service is NOT called, nothing is sent
```

| Layer | Job | Returns |
| ----- | --- | ------- |
| **Service** (`core/services/`) | HTTP, URLs, `UserEntity` → `UserResponse` | `Observable<...>` |
| **Controller** (`core/controllers/`) | "is the logged-in user allowed?" + Observable → Promise | `Promise<...>` |
| **Component** | the form / the page | – (it `await`s) |

> ⚠️ This is a **front-end** check: it hides what the user can't do and avoids useless requests. It is **not** security, anyone can call json-server with curl. A real API must check the permissions again on the server.

---

## 1. Files

```
src/app/core/
├── enums/role.enum.ts            ← RoleEnum.ADMIN = 'admin', RoleEnum.USER = 'user'
└── controllers/
    ├── permissions.ts            ← isLoggedIn(), isAdmin(), isAdminOrSelf(), deny()
    ├── auth.controller.ts        ← login, register (public), logout (logged in)
    ├── user.controller.ts        ← getAll, getOne, create, updateFully, updatePartial, delete
    ├── auth.controller.spec.ts
    ├── user.controller.spec.ts
    └── CONTROLLER.md             ← this file
```

---

## 2. The role

Every person has a `role` (in `UserEntity`, `UserResponse` and `db.json`):

```ts
// src/app/core/enums/role.enum.ts
export enum RoleEnum {
  ADMIN = 'admin',
  USER = 'user',
}
```

| Who | Role |
| --- | ---- |
| Bob (`bob@email.bob` / `BobIsTheBest99#`) | `admin` |
| everybody else in `db.seed.json` | `user` |
| every new account (`UserService.create`) | `user`, always: the service adds `role: RoleEnum.USER` |

> 💡 `UserService.updateFully` (PUT) keeps the current role: PUT replaces the whole object and `RegisterRequest` has no `role`, so without that the role would be deleted.

---

## 3. Write a controller, step by step

### 3.1 The permission helpers (`permissions.ts`)

```ts
export function isLoggedIn(user: UserResponse | null): user is UserResponse {
  return user !== null;
}

export function isAdmin(user: UserResponse | null): boolean {
  return user?.role === RoleEnum.ADMIN;
}

// Admin, or the user working on their OWN account
export function isAdminOrSelf(user: UserResponse | null, id: number): boolean {
  return isAdmin(user) || user?.id === id;
}

// Throws the right error when the check fails
export function deny(user: UserResponse | null): never {
  throw new Error(user ? 'forbidden' : 'unauthorized');
}
```

| Error | When | Same as HTTP |
| ----- | ---- | ------------ |
| `unauthorized` | nobody is logged in | `401 Unauthorized` |
| `forbidden` | logged in, but not allowed | `403 Forbidden` |

> 💡 `never` = "this function never returns normally" (it always throws). TypeScript then knows the code after `if (...) deny(user);` only runs when the check passed.

### 3.2 The controller: check, then call

```ts
@Service()
export class UserController {
  private readonly _userService = inject(UserService);
  private readonly _authService = inject(AuthService);

  // admin only
  async getAll(): Promise<UserResponse[]> {
    const user = this._authService.currentUser();         // 1. who is asking?
    if (!isAdmin(user)) deny(user);                       // 2. not allowed → throw
    return firstValueFrom(this._userService.getAll());    // 3. allowed → Observable → Promise
  }

  // admin, or yourself
  async delete(id: number): Promise<void> {
    const user = this._authService.currentUser();
    if (!isAdminOrSelf(user, id)) deny(user);
    await firstValueFrom(this._userService.delete(id), { defaultValue: undefined });
  }
}
```

- The controller reads the logged-in user **itself** (`AuthService.currentUser()`), the component passes nothing.
- `async` in front of the method: it **always** returns a Promise, even when it throws.

### 3.3 `firstValueFrom`: Observable → Promise

```ts
import { firstValueFrom } from 'rxjs';

const users = await firstValueFrom(this._userService.getAll());
```

| | |
| - | - |
| What it does | subscribes, waits for the **first** value, gives it back as a Promise |
| The Observable errors | the Promise is **rejected** with the same error (→ `catch`) |
| The Observable ends with no value | rejected with `EmptyError`, unless you give `{ defaultValue: ... }` (that's why `delete` has `{ defaultValue: undefined }`) |
| HTTP Observables | send **one** value then end, so `firstValueFrom` is a perfect fit |

> ⚠️ Not for Observables that keep sending values (a timer, a signal turned into an Observable...): you'd only get the first one. Use `subscribe` for those.

### 3.4 Why a plain `throw` is fine here

Inside an `async` method, `throw` doesn't crash anything: it turns into a **rejected Promise**, and the component's `try/catch` gets it, exactly like an HTTP error.

```ts
async getAll() {
  if (!isAdmin(user)) throw new Error('forbidden'); // → rejected Promise, not a crash
  ...
}
```

---

## 4. Who can do what

### `UserController`

| Method | Allowed | Returns |
| ------ | ------- | ------- |
| `getAll()` | admin | `Promise<UserResponse[]>` |
| `getOne(id)` | admin, or yourself | `Promise<UserResponse>` |
| `create(request)` | admin (people make their own account with `AuthController.register`) | `Promise<UserResponse>` |
| `updateFully(id, request)` | admin, or yourself | `Promise<UserResponse>` |
| `updatePartial(id, changes)` | admin, or yourself | `Promise<UserResponse>` |
| `delete(id)` | admin, or yourself | `Promise<void>` |

### `AuthController`

| Method | Allowed | Returns |
| ------ | ------- | ------- |
| `login(request)` | everybody (public) | `Promise<UserResponse>` |
| `register(request)` | everybody (public) | `Promise<UserResponse>` |
| `logout()` | logged in | `Promise<void>` |

Change a rule? Change the `if` in that method. Need a new rule (e.g. "premium only")? Add a helper in `permissions.ts`:

```ts
export function isPremium(user: UserResponse | null): boolean {
  return user?.subscription === SubscriptionEnum.PREMIUM;
}
```

---

## 5. Use it in a component

`async` method + `await` + `try/catch`. Put the result in a **signal** so the template shows it.

```ts
export class UserListComponent {
  private readonly _userController = inject(UserController);

  users = signal<UserResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.load(); // no await needed here: load() handles its own errors
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.users.set(await this._userController.getAll());
    } catch (err) {
      this.error.set((err as Error).message); // 'forbidden', 'unauthorized', or an HTTP error
    } finally {
      this.loading.set(false); // success OR error
    }
  }

  async delete(id: number) {
    try {
      await this._userController.delete(id);
      this.users.update((users) => users.filter((u) => u.id !== id));
    } catch (err) {
      this.error.set((err as Error).message);
    }
  }
}
```

```html
@if (loading()) {
  <p>Loading...</p>
}
@if (error() === 'forbidden') {
  <p>Only an admin can see this page.</p>
} @else if (error() === 'unauthorized') {
  <p>Log in first.</p>
}

@for (user of users(); track user.id) {
  <p>{{ user.name }} ({{ user.role }}) <button (click)="delete(user.id)">Delete</button></p>
}
```

> 💡 `(click)="delete(user.id)"` works with an `async` method: Angular calls it, the Promise runs on its own.

> 💡 Try it: log in as Bob (admin) → the list loads. Log in as Alice (`alice.dupont@mail.com` / `AliceIsTheBest99#`) → `forbidden`.

| Observable (service) | Promise (controller) |
| -------------------- | -------------------- |
| `service.getAll().subscribe({ next, error })` | `try { const users = await controller.getAll(); } catch (err) { }` |
| `finalize(() => ...)` | `finally { ... }` |
| nothing happens until `subscribe()` | starts **right away** when you call it |

---

## 6. Test it

The controller only needs two fakes: **who is logged in** (a signal in a fake `AuthService`) and **a fake service** that answers with `of(...)`.

```ts
const currentUser = signal<UserResponse | null>(null);
const fakeAuthService = { currentUser };
const fakeUserService = { getAll: vi.fn().mockReturnValue(of([bob, alice])) /* ... */ };

beforeEach(() => {
  vi.clearAllMocks();
  currentUser.set(null); // nobody logged in at the start of each test
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: fakeAuthService },
      { provide: UserService, useValue: fakeUserService },
    ],
  });
  controller = TestBed.inject(UserController);
});

it('returns the list for an admin', async () => {
  currentUser.set(bob); // log in as an admin

  expect(await controller.getAll()).toEqual([bob, alice]);
});

it('is forbidden for a simple user, and the service is NOT called', async () => {
  currentUser.set(alice);

  await expect(controller.getAll()).rejects.toThrow('forbidden');
  expect(fakeUserService.getAll).not.toHaveBeenCalled();
});
```

| Check | How |
| ----- | --- |
| Allowed → the result | `expect(await controller.x()).toEqual(...)` |
| Not allowed → the error | `await expect(controller.x()).rejects.toThrow('forbidden')` |
| Not allowed → nothing sent | `expect(fakeService.x).not.toHaveBeenCalled()` |

> ⚠️ Don't forget the `await` before `expect(...).rejects`: without it the test ends before the Promise, and passes even when it's wrong.

Full examples: `auth.controller.spec.ts`, `user.controller.spec.ts`.

---

## 🐛 Troubleshooting

### I get `[object Promise]` / `Promise {<pending>}` instead of the data

You forgot `await`: `const users = controller.getAll()` gives the Promise, not the users. Write `await controller.getAll()` inside an `async` method.

### `'await' expressions are only allowed within async functions`

Add `async` in front of the method: `async load() { ... }`.

### `Uncaught (in promise) Error: forbidden` in the console

Nobody caught the rejected Promise. Put the `await` in a `try { } catch { }`.

### `EmptyError: no elements in sequence`

`firstValueFrom` got an Observable that ended without a value. Give it a default: `firstValueFrom(obs, { defaultValue: undefined })`.

### `forbidden` for Bob too

- Bob isn't logged in **as admin**: check `db.json` has `"role": "admin"` for him. Old `db.json` from before the roles? Run `npm run api:reset`.
- The check ran **before** the login finished. `await` the login first, then call the controller.

### `unauthorized` right after a page refresh

`currentUser` lives in memory: a refresh logs you out. Keeping the login (token, localStorage) is for the tokens cheat sheet.

### A new user registered from the app is not admin

Normal: `UserService.create` always sets `role: 'user'`. Make admins by editing `db.json` (or `db.seed.json` + `npm run api:reset`).

### The role disappeared after a PUT

`updateFully` must send the role back (it does, see section 2). If you write your own PUT, send `role` too, or use PATCH.
