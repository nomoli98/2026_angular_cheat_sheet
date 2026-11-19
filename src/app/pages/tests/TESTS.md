# Tests in Angular 22

> 📖 **Official docs:** [Testing overview](https://angular.dev/guide/testing) · [Playwright](https://playwright.dev/docs/intro)

Two kinds of tests, two tools:

| Folder | Kind | Tool | Command | Doc |
|---|---|---|---|---|
| `unit-test/` | **Unit**: one component or service, alone | Vitest (built into Angular) | `ng test` | [UNIT_TEST.md](./unit-test/UNIT_TEST.md) |
| `e2e-test/` | **End-to-end**: the whole app in a real browser, like a user | Playwright | `npm run e2e` | [E2E_TEST.md](./e2e-test/E2E_TEST.md) |

## The demo pages

All lazy-loaded from `tests.routes.ts` under `/tests/...`:

| URL | Shows |
|---|---|
| `/tests/unit-test` | A counter, a greeting (`input()` / `output()`), a service and a login form, each with its `.spec.ts` |
| `/tests/e2e-test` | The login form + how to install, configure, write and run Playwright tests |

## Where the files are

```
├── playwright.config.ts                     Playwright settings
├── e2e/                                     e2e tests (outside src/!)
│   ├── navigation.spec.ts
│   └── login.spec.ts
└── src/app/
    ├── core/services/
    │   ├── auth.service.ts                  basic fake login / register service
    │   └── auth.service.spec.ts
    └── components/tests/
        ├── tests.routes.ts
        ├── unit-test/
        │   ├── counter/                     component + counter.component.spec.ts
        │   ├── greeting/                    component + greeting.component.spec.ts
        │   └── login-form/                  component + login-form.component.spec.ts
        └── e2e-test/                        the demo page
```

## Same task, two tools

| Task | Unit test (Vitest) | E2E (Playwright) |
|---|---|---|
| Imports | none (`describe`, `it`, `expect`, `vi` are global) | `import { test, expect } from '@playwright/test'` |
| One test | `it('...', () => {})` | `test('...', async ({ page }) => {})` |
| Before each test | `beforeEach(...)` | `test.beforeEach(...)` |
| Show the thing | `TestBed.createComponent(X)` | `await page.goto('/url')` |
| Find an element | `html.querySelector('#email')` | `page.getByLabel('Email')` |
| Click | `button.click()` | `await page.getByRole('button', { name: 'Log in' }).click()` |
| Type | `input.value = 'x'; input.dispatchEvent(new Event('input'))` | `await page.getByLabel('Email').fill('x')` |
| Wait for the screen | `await fixture.whenStable()` | nothing: `expect` waits by itself |
| Check text | `expect(el.textContent).toContain('Bob')` | `await expect(locator).toContainText('Bob')` |
