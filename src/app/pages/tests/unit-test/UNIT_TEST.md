# Unit tests (Vitest)

> 📖 **Official docs:** [Testing overview](https://angular.dev/guide/testing) · [Testing components](https://angular.dev/guide/testing/components-basics) · [Testing services](https://angular.dev/guide/testing/services) · [Vitest `expect`](https://vitest.dev/api/expect.html)

A unit test checks **one small piece** of your app (a component, a service) **on its own**, in a fake browser (jsdom). It's fast: hundreds of tests run in a second.

Angular 22 uses **Vitest**. It's already set up when you create a project with `ng new`. Nothing to install.

Demo page: `/tests/unit-test`

Files:

| Folder | What it shows |
|---|---|
| `counter/` | Component basics: create, read the HTML, click |
| `greeting/` | `input()` and `output()` |
| `../../../core/services/auth.service.spec.ts` | A service |
| `../../../core/controllers/*.spec.ts` | A controller (signals + a fake service) |
| `login-form/` | A form + replacing a controller with a fake |

---

## 0. Run the tests

```bash
ng test                    # watch mode: re-runs when you save
ng test --watch=false      # run once and stop
ng test --include src/app/pages/tests/unit-test/counter/counter.component.spec.ts   # one file
```

- Test files end with **`.spec.ts`** and sit **next to** the file they test.
- `ng generate component` doesn't create one in this repo (`skipTests: true` in `angular.json`). Create it by hand.

---

## 1. The shape of every test file

```ts
describe('CounterComponent', () => {   // a group of tests (usually: one per file)

  beforeEach(async () => {             // runs before EACH test → every test starts fresh
    // create the thing you test
  });

  it('starts at 0', () => {            // one test = one thing to check
    // 1. Arrange: prepare
    // 2. Act:     do something (click, call a method)
    // 3. Assert:  check the result with expect(...)
  });
});
```

`describe`, `it`, `beforeEach`, `expect` and `vi` are **global**: no import needed (see `"types": ["vitest/globals"]` in `tsconfig.spec.json`).

---

## 2. Cheat table: "I want to..."

| I want to... | Write this |
|---|---|
| Create a component | `fixture = TestBed.createComponent(CounterComponent);` |
| Get the class (the `.ts`) | `component = fixture.componentInstance;` |
| Get the rendered HTML | `html = fixture.nativeElement;` |
| **Wait for the HTML to update** | `await fixture.whenStable();` |
| Find an element | `html.querySelector('button')` / `html.querySelector('#email')` |
| Read its text | `html.querySelector('p')?.textContent` |
| Click | `button.click();` |
| Type in an input | `input.value = 'Bob'; input.dispatchEvent(new Event('input'));` |
| Give a value to an `input()` | `fixture.componentRef.setInput('name', 'Bob');` |
| Listen to an `output()` | `component.greet.subscribe(spy);` |
| Create a spy (fake function) | `const spy = vi.fn();` |
| Get a service | `service = TestBed.inject(AuthService);` |
| Replace a service / controller with a fake | `TestBed.configureTestingModule({ providers: [{ provide: AuthController, useValue: fake }] });` |
| Fake the backend (no server) | `providers: [provideHttpClient(), provideHttpClientTesting()]` |
| Answer an HTTP request | `TestBed.inject(HttpTestingController).expectOne(url).flush(data);` |
| Wait for an Observable in a test | `const value = await firstValueFrom(service.getAll());` |

---

## 3. Component basics

The component (`counter/`):

```ts
export class CounterComponent {
  count = signal(0);
  increment() { this.count.update((value) => value + 1); }
  reset() { this.count.set(0); }
}
```
```html
<p>Count: {{ count() }}</p>
<button (click)="increment()">+1</button>
<button (click)="reset()">Reset</button>
```

The test:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounterComponent } from './counter.component';

describe('CounterComponent', () => {
  let fixture: ComponentFixture<CounterComponent>;
  let component: CounterComponent; // the class (the .ts)
  let html: HTMLElement;           // the rendered page (the .html)

  beforeEach(async () => {
    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    html = fixture.nativeElement;
    await fixture.whenStable();    // wait for the HTML to be drawn
  });

  it('starts at 0', () => {
    expect(html.querySelector('p')?.textContent).toContain('Count: 0');
  });

  // Test the CLASS: call a method, check the signal
  it('increment() adds 1', () => {
    component.increment();
    expect(component.count()).toBe(1);
  });

  // Test like a USER: click, check the screen
  it('clicking +1 shows the new count', async () => {
    html.querySelector('button')!.click();
    await fixture.whenStable();    // ⚠️ without this, the HTML still says 0
    expect(html.querySelector('p')?.textContent).toContain('Count: 1');
  });
});
```

Two ways to test, both are fine:

| Test the class | Test like a user |
|---|---|
| `component.increment()` then `expect(component.count())` | `button.click()` then `await whenStable()` then read the HTML |
| Simple, fast | Also checks the HTML is wired correctly |

> 💡 The `ng generate` test puts the component in `TestBed.configureTestingModule({ imports: [...] })`. For a standalone component you can skip that: `createComponent` is enough. You only need `configureTestingModule` to add **providers** (see section 6).

---

## 4. Inputs and outputs

The component (`greeting/`):

```ts
export class GreetingComponent {
  name = input.required<string>();
  greet = output<string>();

  sayHi() { this.greet.emit(`Hi ${this.name()}!`); }
}
```

The test:

```ts
beforeEach(async () => {
  fixture = TestBed.createComponent(GreetingComponent);
  html = fixture.nativeElement;

  fixture.componentRef.setInput('name', 'Bob');   // 👈 play the parent: <app-greeting name="Bob" />
  await fixture.whenStable();
});

it('shows the name it received', () => {
  expect(html.querySelector('p')?.textContent).toContain('Hello Bob');
});

it('emits a message when the button is clicked', () => {
  const spy = vi.fn();                              // a fake function that remembers its calls
  fixture.componentInstance.greet.subscribe(spy);  // 👈 play the parent: (greet)="spy($event)"

  html.querySelector('button')!.click();

  expect(spy).toHaveBeenCalledWith('Hi Bob!');
});
```

- **Input** → `fixture.componentRef.setInput('inputName', value)`. Use the input's name (or its alias).
- **Output** → `.subscribe(spy)` then `expect(spy).toHaveBeenCalledWith(...)`.

---

## 5. A service (that calls an API)

A service has no HTML, so no fixture. Ask Angular for it with `TestBed.inject()` and call its methods.

`AuthService` calls the fake API (`GET /people?email=...`). In a unit test you **don't** want a real server, so:

| Provider | What it does |
|---|---|
| `provideHttpClient()` | the normal `HttpClient` |
| `provideHttpClientTesting()` | catches every request: **nothing leaves the test** |
| `HttpTestingController` | lets the test find a request and **answer it** |

```ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],   // 👈 fake backend
    });
    service = TestBed.inject(AuthService);   // like inject(AuthService) in a component
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();   // fails if a request was sent but never answered
  });

  it('logs in with the right email and password', async () => {
    // 1. call the method (firstValueFrom: Observable → Promise, and it subscribes)
    const result = firstValueFrom(service.login({ email: 'bob@email.bob', password: 'BobIsTheBest99#' }));

    // 2. find the request and answer it, like the server would
    const req = httpTesting.expectOne((r) => r.url === url && r.params.get('email') === 'bob@email.bob');
    req.flush([bob]);

    // 3. check the result
    const user = await result;
    expect(user.name).toBe('Bob Martin');
    expect(service.currentUser()?.name).toBe('Bob Martin');
  });

  it('refuses a wrong password', async () => {
    const result = firstValueFrom(service.login({ email: 'bob@email.bob', password: 'wrong' }));

    httpTesting.expectOne((r) => r.url === url).flush([bob]);

    await expect(result).rejects.toThrow('bad credentials');   // the Observable errored
    expect(service.currentUser()).toBeNull();
  });
});
```

(`url` = `` `${environment.apiUrl}/people` ``, `bob` = a `UserEntity`, see the full file `core/services/auth.service.spec.ts`.)

| `HttpTestingController` | What it does |
|---|---|
| `expectOne(url)` / `expectOne((r) => ...)` | finds **exactly one** matching request (fails if 0 or 2+) |
| `req.request.method` / `req.request.params` | check what was sent |
| `req.flush(data)` | answers with `data` (status 200) |
| `req.flush('Not found', { status: 404, statusText: 'Not Found' })` | answers with an error |
| `expectNone(url)` | fails if a matching request was sent |
| `verify()` | fails if a request is still waiting for an answer |

> ⚠️ An Observable sends **nothing** until someone subscribes. `firstValueFrom(...)` subscribes for you. Without it, `expectOne` fails with "found none".

> Every test gets a **new** service, so the logged-in user from one test is gone in the next one.

---

## 6. A form + a fake controller (mock)

### Type in a field

Setting `.value` isn't enough: the form only listens to the **`input` event**.

```ts
function type(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}
```

### Test the validation and the submit

```ts
it('disables the button when the form is empty', () => {
  expect(button().disabled).toBe(true);
});

it('marks a bad email as invalid', () => {
  type(email(), 'not-an-email');
  expect(fixture.componentInstance.loginForm.controls.email.invalid).toBe(true);
});

it('shows the welcome message after a good login', async () => {
  type(email(), 'bob@email.bob');
  type(password(), 'BobIsTheBest99#');
  await fixture.whenStable();     // the button becomes enabled

  button().click();               // real AuthController → real AuthService → GET /people?email=...
  httpTesting.expectOne((r) => r.params.get('email') === 'bob@email.bob').flush([bob]);
  await fixture.whenStable();     // the welcome message appears

  expect(html.textContent).toContain('Welcome, Bob Martin!');
});
```

Same setup as the service test: `provideHttpClient()` + `provideHttpClientTesting()` in `configureTestingModule`, and `httpTesting.verify()` in `afterEach`.

### Replace the controller with a fake

Why? To test **only the component**: no controller logic, no service, no HTTP. The login form uses `AuthController` (see `core/controllers/CONTROLLER.md`), so we fake that.

A controller exposes **signals** and **methods** that return nothing, so the fake is simple: real signals you `.set()` yourself, and `vi.fn()` for the methods.

```ts
const fakeAuth = {
  currentUser: signal(null),
  error: signal<string | null>(null),
  loading: signal(false),
  login: vi.fn(),
  logout: vi.fn(),
};

beforeEach(async () => {
  vi.clearAllMocks();   // the spies forget the calls from the previous test
  fakeAuth.error.set(null);

  TestBed.configureTestingModule({
    providers: [{ provide: AuthController, useValue: fakeAuth }],   // 👈 "give fakeAuth instead"
  });
  fixture = TestBed.createComponent(LoginFormComponent);
  html = fixture.nativeElement;
  await fixture.whenStable();
});

it('sends the typed email and password to the controller', async () => {
  type(email(), 'bob@email.bob');
  type(password(), '1234');
  await fixture.whenStable();

  button().click();

  expect(fakeAuth.login).toHaveBeenCalledWith({ email: 'bob@email.bob', password: '1234' });
});

it('shows the error the controller gives', async () => {
  fakeAuth.error.set('Wrong email or password');   // just set the signal
  await fixture.whenStable();

  expect(html.textContent).toContain('Wrong email or password');
});
```

The fake only needs what the component **uses** (`currentUser`, `error`, `loading`, `login`, `logout`).

| Spy | What it does |
|---|---|
| `vi.fn()` | Fake function, returns `undefined` |
| `vi.fn().mockReturnValue(true)` | Fake function, returns `true` |
| `vi.fn().mockReturnValue(of(user))` | Fake function, returns an Observable that gives `user` (`of` from `rxjs`) |
| `vi.fn().mockReturnValue(throwError(() => new Error('x')))` | Fake function, returns an Observable that errors |
| `vi.spyOn(service, 'login')` | Watches the **real** method (still runs it) |
| `vi.spyOn(service, 'login').mockReturnValue(true)` | Replaces the real method |

---

## 7. The `expect` you'll use most

| Check | Write |
|---|---|
| Equal (number, string, boolean) | `expect(x).toBe(3)` |
| Equal (object, array) | `expect(user).toEqual({ name: 'Bob' })` |
| Contains text / item | `expect(text).toContain('Bob')` · `expect(list).toContain(item)` |
| `true` / `false` / `null` / exists | `toBe(true)` · `toBe(false)` · `toBeNull()` · `toBeTruthy()` |
| Array length | `expect(list).toHaveLength(2)` |
| Spy was called | `expect(spy).toHaveBeenCalled()` |
| Spy was called with | `expect(spy).toHaveBeenCalledWith('Hi Bob!')` |
| Spy was called N times | `expect(spy).toHaveBeenCalledTimes(1)` |
| The opposite | `expect(x).not.toBe(3)` |

---

## 🐛 Troubleshooting

### The HTML didn't change after a click / a `setInput`

You forgot `await fixture.whenStable();` after the action (and the test must be `async`).

### `NG0950: Input is required but no value is available yet`

The component has an `input.required()` and you didn't give it a value. Call `fixture.componentRef.setInput(...)` **before** the first `whenStable()`.

### `setInput(...)` does nothing

Check the spelling: `setInput('nam', ...)` with a typo doesn't always throw an error. If the input has an alias, use the alias.

### `NG0201: No provider found for XxxService`

The service isn't `providedIn: 'root'`. Add it in the test: `TestBed.configureTestingModule({ providers: [XxxService] })`.

### `NG0201: No provider found for HttpClient` (or `_HttpClient`)

The component or service uses `HttpClient` (directly or through a service). Add both in the test:
`TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] })`.

### `Expected one matching request ..., found none`

Nobody subscribed, so the request was never sent. In a service test wrap the call in `firstValueFrom(...)`, in a component check that the method calls `.subscribe()`.

### `querySelector(...)` returns `null`

- The element is inside an `@if` that is false → change the state first, then `await fixture.whenStable()`.
- Wrong selector: `#email` is the **id**, `.email` is a **class**, `email` is a **tag**.

### The form button stays disabled even after typing

You set `input.value` but didn't send the event: `input.dispatchEvent(new Event('input'))`. Then `await fixture.whenStable()`.

### `Cannot find name 'describe'` / `'vi'` in VS Code

Check `"types": ["vitest/globals"]` in `tsconfig.spec.json`, then restart VS Code's TS server (*Ctrl+Shift+P → TypeScript: Restart TS Server*).

### A spy says it was called 2 times instead of 1

The fake is created once (outside `beforeEach`), so calls from the previous test are still counted. Call `vi.clearAllMocks()` at the start of `beforeEach`.
