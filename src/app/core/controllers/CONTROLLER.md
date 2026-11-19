# Controllers: state between the components and the services

> 📖 **Official docs:** [Signals](https://angular.dev/guide/signals) · [Services and DI](https://angular.dev/guide/di) · [RxJS `finalize`](https://rxjs.dev/api/operators/finalize)

A **controller** is a service that sits between the components and the HTTP services. It calls the service, **subscribes**, and keeps the result in **signals** (the data, `loading`, `error`). The component only reads signals and calls methods.

```
Component ──calls──▶ Controller ──calls──▶ Service ──HTTP──▶ json-server
    ▲                   │  subscribes,           returns
    └──reads signals────┘  fills signals         Observables
```

| Layer | Knows about | Returns | Example |
| ----- | ----------- | ------- | ------- |
| **Service** (`core/services/`) | HTTP, URLs, `UserEntity`, the mapper | `Observable<...>` | `UserService.getAll()` |
| **Controller** (`core/controllers/`) | the services, the state, error messages | `void` (results go in signals) | `UserController.loadAll()` → `users()` |
| **Component** | the controller, the HTML | – | `@for (user of users.users(); ...)` |

Why a controller layer?
- **No `subscribe` in components**: no forgotten subscribe, no repeated `loading.set(true)` / `error` code in every component.
- **One place for the state**: the list of users is in `UserController.users()`, every component sees the same list.
- **Readable errors**: `'bad credentials'` becomes `'Wrong email or password'` in one place.

---

## 1. Files

```
src/app/core/controllers/
├── auth.controller.ts       ← login, register, logout + currentUser, loading, error
├── user.controller.ts       ← list / one / create / update / delete + users, selected, loading, error
├── error-message.ts         ← any error → a text for the user
├── auth.controller.spec.ts
├── user.controller.spec.ts
└── CONTROLLER.md            ← this file
```

---

## 2. Write a controller, step by step

### 2.1 A `@Service()` that injects the service

```ts
import { computed, inject, Service, signal } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { UserService } from '@core/services/user.service';

@Service() // one instance for the whole app (like providedIn: 'root')
export class UserController {
  private readonly _userService = inject(UserService);
}
```

### 2.2 The state: private writable signals, public read-only ones

```ts
private readonly _users = signal<UserResponse[]>([]);
private readonly _loading = signal(false);
private readonly _error = signal<string | null>(null);

readonly users = this._users.asReadonly();      // components can READ, not .set()
readonly loading = this._loading.asReadonly();
readonly error = this._error.asReadonly();
readonly count = computed(() => this._users().length); // derived value
```

> 💡 `asReadonly()`: only the controller can change the state. A component calling `users.set([])` would not compile.

### 2.3 The actions: call, subscribe, fill the signals

Every action does the same 4 steps, so they're in one helper:

```ts
private _run<T>(request: Observable<T>, onSuccess: (value: T) => void): void {
  this._loading.set(true);                               // 1. loading on
  this._error.set(null);                                 // 2. old error off
  request.pipe(finalize(() => this._loading.set(false))) // 4. loading off (success OR error)
    .subscribe({
      next: onSuccess,                                   // 3a. put the result in a signal
      error: (err) => this._error.set(errorMessage(err)),// 3b. or a readable error
    });
}

loadAll(): void {
  this._run(this._userService.getAll(), (users) => this._users.set(users));
}
```

| Piece | Why |
| ----- | --- |
| `finalize(...)` | runs when the Observable **ends**, after a success **or** an error. Without it, an error leaves `loading` stuck on `true` |
| `errorMessage(err)` | see section 5 |
| returns `void` | the result is in a signal, not returned |

### 2.4 After a write: update the list locally

No need to call `loadAll()` again after a create/update/delete: the service already returns the new user, so update the signal with `.update()`:

```ts
create(request: RegisterRequest, onSuccess?: () => void): void {
  this._run(this._userService.create(request), (user) => {
    this._users.update((users) => [...users, user]);          // add
    onSuccess?.();
  });
}

updatePartial(id: number, changes: Partial<RegisterRequest>, onSuccess?: () => void): void {
  this._run(this._userService.updatePartial(id, changes), (user) => {
    this._users.update((users) => users.map((u) => (u.id === user.id ? user : u))); // replace
    onSuccess?.();
  });
}

delete(id: number, onSuccess?: () => void): void {
  this._run(this._userService.delete(id), () => {
    this._users.update((users) => users.filter((u) => u.id !== id)); // remove
    onSuccess?.();
  });
}
```

> ⚠️ Always give `.update()` a **new** array (`[...users, user]`, `.map`, `.filter`). `users.push(user)` changes the same array: the signal doesn't see a change and the HTML doesn't update.

### 2.5 `onSuccess`: do something after it worked

The controller doesn't know about pages, so things like "go to the home page after register" are passed in by the component:

```ts
private readonly _router = inject(Router);

onSubmit() {
  this.auth.register(request, () => this._router.navigate(['/']));
}
```

---

## 3. What each controller gives you

### `AuthController`

| Member | Type | What it is |
| ------ | ---- | ---------- |
| `currentUser()` | `UserResponse \| null` | the logged-in user (comes from `AuthService`) |
| `isLoggedIn()` | `boolean` | `currentUser() !== null` |
| `loading()` | `boolean` | a login/register is running |
| `error()` | `string \| null` | readable error of the last call |
| `login(request, onSuccess?)` | `void` | `AuthService.login` |
| `register(request, onSuccess?)` | `void` | `AuthService.register` (refuses a taken email) |
| `logout()` | `void` | empties `currentUser` and `error` |
| `clearError()` | `void` | hides the error |

### `UserController`

| Member | Type | What it is |
| ------ | ---- | ---------- |
| `users()` | `UserResponse[]` | the list (filled by `loadAll`, kept in sync by create/update/delete) |
| `selected()` | `UserResponse \| null` | the user loaded by `loadOne` |
| `count()` | `number` | `users().length` |
| `loading()` / `error()` | `boolean` / `string \| null` | same as above |
| `loadAll()` / `loadOne(id)` | `void` | fill `users` / `selected` |
| `create(request, onSuccess?)` | `void` | adds to `users` |
| `updateFully(id, request, onSuccess?)` / `updatePartial(id, changes, onSuccess?)` | `void` | replaces in `users` (and `selected`) |
| `delete(id, onSuccess?)` | `void` | removes from `users` |
| `clearError()` | `void` | hides the error |

---

## 4. Use it in a component

### 4.1 The login form (`pages/tests/unit-test/login-form/`)

```ts
export class LoginFormComponent {
  protected readonly auth = inject(AuthController);

  loginForm = new FormGroup({ /* email, password */ });

  onSubmit() {
    this.auth.login(this.loginForm.getRawValue()); // no subscribe!
  }

  logout() {
    this.auth.logout();
    this.loginForm.reset();
  }
}
```

```html
@if (auth.currentUser(); as user) {
  <p>Welcome, {{ user.name }}!</p>
  <button type="button" (click)="logout()">Log out</button>
} @else {
  <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
    <!-- inputs -->
    @if (auth.error(); as error) {
      <p>{{ error }}</p>
    }
    <button type="submit" [disabled]="loginForm.invalid || auth.loading()">
      {{ auth.loading() ? 'Logging in...' : 'Log in' }}
    </button>
  </form>
}
```

### 4.2 A list of users

```ts
export class UserListComponent {
  protected readonly users = inject(UserController);

  constructor() {
    this.users.loadAll(); // load once when the component is created
  }
}
```

```html
@if (users.loading()) {
  <p>Loading...</p>
}
@if (users.error(); as error) {
  <p class="text-danger">{{ error }}</p>
}

<p>{{ users.count() }} people</p>
<ul>
  @for (user of users.users(); track user.id) {
    <li>
      {{ user.name }}
      <button type="button" (click)="users.delete(user.id)">Delete</button>
    </li>
  }
</ul>
```

Delete → the controller removes the user from `users()` → the `@for` updates by itself.

---

## 5. `errorMessage()`: readable errors

`core/controllers/error-message.ts` turns any error into a text:

| Error | Message |
| ----- | ------- |
| `HttpErrorResponse` status `0` | `The server is not reachable. Is the API running?` |
| `HttpErrorResponse` status `404` | `Not found` |
| other `HttpErrorResponse` | `Server error (500)` |
| `Error('bad credentials')` (from `AuthService.login`) | `Wrong email or password` |
| `Error('email already taken')` (from `AuthService.register`) | `This email is already taken` |
| `Error('user not found')` (from `UserService` update/delete) | `This user does not exist` |
| any other `Error` | its `message` |

A service throws a new error? Add a `case` in the `switch`.

---

## 6. One shared instance, or one per component?

`@Service()` = **one** controller for the whole app. That's what you want for `AuthController` (everyone sees the same logged-in user). But the state **stays** when you change page: an old `error()` is still there when you come back. Call `clearError()` when needed.

Want a **fresh** controller for each component (e.g. two independent user lists)?

```ts
@Service({ autoProvided: false }) // not provided automatically anymore
export class UserController { ... }

@Component({
  providers: [UserController], // 👈 a new one for this component (and its children)
  ...
})
export class UserListComponent {
  protected readonly users = inject(UserController);
}
```

It's created with the component and destroyed with it.

---

## 7. Test it

### 7.1 Test a controller: fake the service

The controller doesn't do HTTP itself, so give it a fake service that answers with `of(...)` (success) or `throwError(...)` (error):

```ts
const fakeUserService = { getAll: vi.fn(), delete: vi.fn() /* ... */ };

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [{ provide: UserService, useValue: fakeUserService }],
  });
  controller = TestBed.inject(UserController);
});

it('loadAll() fills the users signal', () => {
  fakeUserService.getAll.mockReturnValue(of([bob, alice]));

  controller.loadAll();

  expect(controller.users()).toEqual([bob, alice]);
});

it('shows a readable error', () => {
  fakeUserService.delete.mockReturnValue(throwError(() => new Error('user not found')));

  controller.delete(999);

  expect(controller.error()).toBe('This user does not exist');
});
```

`of(...)` answers **right away**, so no `await` is needed. To test `loading` **during** the call, use a `Subject` and answer when you want:

```ts
const answer = new Subject<UserResponse>();
fakeAuthService.login.mockReturnValue(answer);

controller.login({ email: 'bob@email.bob', password: 'x' });
expect(controller.loading()).toBe(true);   // still waiting

answer.next(bob);
answer.complete();
expect(controller.loading()).toBe(false);  // finalize ran
```

### 7.2 Test a component: fake the controller

The fake only needs what the component uses. Signals for the state, `vi.fn()` for the methods:

```ts
const fakeAuth = {
  currentUser: signal(null),
  error: signal<string | null>(null),
  loading: signal(false),
  login: vi.fn(),
  logout: vi.fn(),
};

TestBed.configureTestingModule({
  providers: [{ provide: AuthController, useValue: fakeAuth }],
});

it('shows the error the controller gives', async () => {
  fakeAuth.error.set('Wrong email or password'); // just set the signal
  await fixture.whenStable();

  expect(html.textContent).toContain('Wrong email or password');
});
```

Full examples: `auth.controller.spec.ts`, `user.controller.spec.ts`, `pages/tests/unit-test/login-form/login-form.component.spec.ts`.

---

## 🐛 Troubleshooting

### `loading()` stays `true` forever

- The `finalize(...)` is missing → add it in the `pipe`, so it runs after an error too.
- The Observable never ends (e.g. a `Subject` in a test without `.complete()`). HTTP Observables always end.

### The list doesn't update after create / delete

You changed the array in place (`users.push(...)`, `users.splice(...)`). Give `.update()` a **new** array: `[...users, user]`, `users.filter(...)`, `users.map(...)`.

### Nothing happens when I call a controller method

Check the controller **subscribes** (`_run(...)` does). An Observable that nobody subscribes to sends no request. In the browser Network tab you should see the request.

### The error shows something like `user not found` instead of a nice text

That message has no `case` in `error-message.ts` yet. Add it.

### An old error is still shown when I come back to a page

The controller is shared (`@Service()`), so its state survives page changes. Call `controller.clearError()` (e.g. in the component's constructor), or give the component its own controller (section 6).

### `NG0201: No provider found for HttpClient` in a component test

The component uses the **real** controller → real service → `HttpClient`. Either fake the controller (7.2), or add `provideHttpClient(), provideHttpClientTesting()` to the test providers.
