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
| `login-form/` | A form + replacing a service with a fake |

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
| Replace a service with a fake | `TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: fake }] });` |

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

## 5. A service

A service has no HTML, so no fixture. Ask Angular for it with `TestBed.inject()` and call its methods.

```ts
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = TestBed.inject(AuthService);   // like inject(AuthService) in a component
  });

  it('logs in with the right email and password', () => {
    const result = service.login('bob@email.bob', 'BobIsTheBest99#');

    expect(result).toBe(true);
    expect(service.currentUser()?.name).toBe('Bob');
  });

  it('refuses a wrong password', () => {
    expect(service.login('bob@email.bob', 'wrong')).toBe(false);
    expect(service.currentUser()).toBeNull();
  });
});
```

> Every test gets a **new** service, so a user registered in one test is gone in the next one.

`AuthService` is a fake on purpose: a list of users in memory, no server, no token. Bob is already registered.

---

## 6. A form + a fake service (mock)

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

  button().click();
  await fixture.whenStable();     // the welcome message appears

  expect(html.textContent).toContain('Welcome, Bob!');
});
```

### Replace the service with a fake

Why? To test **only the component**. With a real service that calls a server, your test would need the server.

```ts
const fakeAuth = {
  currentUser: signal(null),
  login: vi.fn().mockReturnValue(false),   // always answers "wrong password"
  logout: vi.fn(),
};

beforeEach(async () => {
  vi.clearAllMocks();   // the spies forget the calls from the previous test

  TestBed.configureTestingModule({
    providers: [{ provide: AuthService, useValue: fakeAuth }],   // 👈 "give fakeAuth instead"
  });
  fixture = TestBed.createComponent(LoginFormComponent);
  html = fixture.nativeElement;
  await fixture.whenStable();
});

it('sends the typed email and password to the service', async () => {
  type(email(), 'bob@email.bob');
  type(password(), '1234');
  await fixture.whenStable();

  button().click();

  expect(fakeAuth.login).toHaveBeenCalledWith('bob@email.bob', '1234');
});
```

The fake only needs what the component **uses** (`currentUser`, `login`, `logout`).

| Spy | What it does |
|---|---|
| `vi.fn()` | Fake function, returns `undefined` |
| `vi.fn().mockReturnValue(true)` | Fake function, returns `true` |
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

### `querySelector(...)` returns `null`

- The element is inside an `@if` that is false → change the state first, then `await fixture.whenStable()`.
- Wrong selector: `#email` is the **id**, `.email` is a **class**, `email` is a **tag**.

### The form button stays disabled even after typing

You set `input.value` but didn't send the event: `input.dispatchEvent(new Event('input'))`. Then `await fixture.whenStable()`.

### `Cannot find name 'describe'` / `'vi'` in VS Code

Check `"types": ["vitest/globals"]` in `tsconfig.spec.json`, then restart VS Code's TS server (*Ctrl+Shift+P → TypeScript: Restart TS Server*).

### A spy says it was called 2 times instead of 1

The fake is created once (outside `beforeEach`), so calls from the previous test are still counted. Call `vi.clearAllMocks()` at the start of `beforeEach`.
