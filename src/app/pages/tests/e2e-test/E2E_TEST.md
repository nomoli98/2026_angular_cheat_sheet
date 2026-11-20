# E2E tests (Playwright)

> 📖 **Official docs:** [Playwright: getting started](https://playwright.dev/docs/intro) · [Locators](https://playwright.dev/docs/locators) · [Assertions](https://playwright.dev/docs/test-assertions) · [Running your app first (`webServer`)](https://playwright.dev/docs/test-webserver)

An end-to-end (e2e) test opens **your real app** in a **real browser** and uses it **like a user**: go to a page, type, click, check what's on the screen.

Demo page: `/tests/e2e-test` (the login form Playwright tests)

Files:

| File                                  | What it is                                                          |
| ------------------------------------- | ------------------------------------------------------------------- |
| `playwright.config.ts` (project root) | The settings                                                        |
| `e2e/navigation.spec.ts`              | Open the home page, click a link                                    |
| `e2e/login.spec.ts`                   | Fill the login form, check the result                               |
| `e2e/register.spec.ts`                | The step-by-step example (section 4): register, happy path + error  |
| `e2e/token.spec.ts`                   | The token version: still logged in after a refresh, protected route |

---

## Unit test or e2e test?

|                   | Unit test (Vitest)                | E2E test (Playwright)                                |
| ----------------- | --------------------------------- | ---------------------------------------------------- |
| Tests             | One component / service **alone** | The **whole app**, like a user                       |
| Runs in           | A fake browser (jsdom)            | A real browser (Chrome, Firefox, Safari)             |
| Needs `ng serve`? | No                                | Yes, + the fake API (Playwright starts both for you) |
| Speed             | Very fast (ms)                    | Slower (~1 s per test)                               |
| Files             | `src/**/*.spec.ts`                | `e2e/*.spec.ts`                                      |
| Command           | `ng test`                         | `npm run e2e`                                        |

Rule of thumb: **lots** of unit tests for the details, **a few** e2e tests for the important paths (login, buy, register...).

---

## 1. Install (once per project)

```bash
npm install -D @playwright/test   # the test library
npx playwright install            # download the browsers (once per computer)
```

> 💡 `npm init playwright@latest` does the same + creates the config and an example. It asks questions: say **TypeScript**, folder **e2e**, **no** GitHub Actions (unless you want it).

Add a script in `package.json`:

```json
"scripts": {
  "e2e": "playwright test"
}
```

Add the generated folders to `.gitignore`:

```
# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```

---

## 2. Configure: `playwright.config.ts`

At the **root** of the project (next to `package.json`):

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e', // where the tests are (NOT in src/)

    use: {
        baseURL: 'http://localhost:4200', // page.goto('/x') → http://localhost:4200/x
        trace: 'retain-on-failure', // keep a recording when a test fails
    },

    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

    webServer: [
        // start the servers before the tests
        {
            command: 'npm run api', // the fake API (the login calls it)
            url: 'http://localhost:3000/people', // Playwright waits until this URL answers
            reuseExistingServer: true, // if it's already running, use it
        },
        {
            command: 'npm run api:auth', // the auth server (token pages)
            url: 'http://localhost:3001/health',
            reuseExistingServer: true,
        },
        {
            command: 'npm start', // the Angular app
            url: 'http://localhost:4200',
            reuseExistingServer: true, // if ng serve is already running, use it
        },
    ],
});
```

`webServer` can be **one object** (one server) or an **array** (several servers, all started before the tests). This app needs all three: the pages call the fake API, the token pages call the auth server.

> ⚠️ Keep the tests **out of `src/`**. `ng test` runs every `src/**/*.spec.ts`, and it would try to run Playwright tests with Vitest.

---

## 3. The shape of a test

```ts
import { test, expect } from '@playwright/test'; // ⚠️ import them (not global like in Vitest)

test.beforeEach(async ({ page }) => {
    // runs before each test
    // start logged OUT: the auth toggle in the navbar logs Bob in by default
    await page.addInitScript(() => localStorage.setItem('auth-toggle', 'off'));
    await page.goto('/tests/e2e-test');
});

test('Bob can log in', async ({ page }) => {
    // `page` = a browser tab
    // 1. find + act
    await page.getByLabel('Email').fill('bob@email.bob');
    await page.getByLabel('Password').fill('BobIsTheBest99#');
    await page.getByRole('button', { name: 'Log in' }).click();

    // 2. check
    await expect(page.getByText('Welcome, Bob Martin!', { exact: true })).toBeVisible();
});
```

> 💡 `page.addInitScript(fn)` runs `fn` in the page **before** the app's own code. Use it to prepare `localStorage`, cookies...

> ⚠️ Put **`await`** in front of every line. Forgetting it is the #1 Playwright bug.

You **don't** need `whenStable()` here: `expect(...)` **waits** (up to 5 s) until the check passes.

---

## 4. Step by step: write a test

### The recipe

1. **Write the story** as a user would do it, in plain sentences: "I open Register, fill the form, click Register, I see Welcome and I'm logged in".
2. **Create the file** in `e2e/` (not in `src/`): `e2e/register.spec.ts`.
3. **Set the start state** in `test.beforeEach`: logged in or out, which page.
4. **Do the steps** with locators the user can see (label, role, text). Not sure how? `npx playwright codegen http://localhost:4200`, click, copy.
5. **Check what the user sees** with `await expect(...)`.
6. **Run it in UI mode** (`--ui`) and watch it. Then break it once on purpose.
7. **Make it repeatable**: the test really changes `db.json`, so it must still pass on the 2nd run.
8. Add the **error case** (one story = one `test`).

### Worked example: the Register page

The page: `/auth/register` (`pages/auth/register/`). It's public, it creates the account and logs the new user in.

#### Step 1. The story

- **Happy path:** I'm logged out → I open Register → I fill name, email, password, birthdate, tick the terms → I click Register → I see "Welcome, Zoe Test!" and the navbar says "Logged in as Zoe Test".
- **Error:** same, with an email that already exists → I see "This email is already taken" and I'm still logged out.

#### Step 2. Create the file

`e2e/register.spec.ts`, at the project root, next to `login.spec.ts`.

#### Step 3. The start state

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    // start logged OUT: the auth toggle in the navbar logs Bob in by default
    await page.addInitScript(() => localStorage.setItem('auth-toggle', 'off'));
    await page.goto('/auth/register');
});
```

Every test gets a **new, empty** browser tab: whatever the test needs (page, login, localStorage) goes here.

#### Step 4. Do the steps

Read the page like a user: each field has a `<label>`, so `getByLabel('Name')` finds the input.

```ts
test('a new user can register and is logged in', async ({ page }) => {
    await page.getByLabel('Name').fill('Zoe Test');
    await page.getByLabel('Email').fill('zoe@test.com');
    await page.getByLabel('Password').fill('ZoeIsTheBest99#');
    await page.getByLabel('Birthdate').fill('1990-05-05'); // <input type="date"> takes 'YYYY-MM-DD'
    await page.getByLabel('I agree to the terms').check();
    await page.getByRole('button', { name: 'Register' }).click();
});
```

#### Step 5. Check what the user sees

```ts
await expect(page.getByText('Welcome, Zoe Test!')).toBeVisible();
await expect(page.getByText('Logged in as Zoe Test')).toBeVisible(); // the navbar
```

No waiting code: `expect` retries for up to 5 s, while the API answers.

#### Step 6. Run it (and fix the first error)

```bash
npx playwright test e2e/register.spec.ts --ui
```

Click ▶ and watch each step. On this page the first run **fails**:

```
Error: strict mode violation: getByRole('button', { name: 'Register' }) resolved to 3 elements:
    1) <button type="submit" class="btn btn-primary"> Register </button>
    2) <button type="button" class="snippet-tab active"> register.component.html </button>
    3) <button type="button" class="snippet-tab"> register.component.ts </button>
```

`name: 'Register'` matches **part** of the name, and the code tabs at the bottom contain "register". Fix: `{ name: 'Register', exact: true }`. Run again: green.

Then break it once: change `'Welcome, Zoe Test!'` to `'Welcome, Nobody!'`. It must fail after 5 s (`npx playwright show-report` → the trace shows the page at that moment). Put it back.

#### Step 7. Make it repeatable

Run it a **second** time: it fails with "This email is already taken". The first run really created `zoe@test.com` in `db.json`!

Fix: a new email on every run.

```ts
const email = `zoe.${Date.now()}@test.com`; // zoe.1763630000000@test.com
await page.getByLabel('Email').fill(email);
```

Run it 2–3 times: always green. (The test users pile up in `db.json`: `npm run api:reset` cleans them.)

#### Step 8. The error case

```ts
test('an email that is already taken shows an error', async ({ page }) => {
    await page.getByLabel('Name').fill('Bob Again');
    await page.getByLabel('Email').fill('bob@email.bob'); // Bob is in db.seed.json
    await page.getByLabel('Password').fill('BobIsTheBest99#');
    await page.getByLabel('Birthdate').fill('1990-05-05');
    await page.getByLabel('I agree to the terms').check();
    await page.getByRole('button', { name: 'Register', exact: true }).click();

    await expect(page.getByText('This email is already taken', { exact: true })).toBeVisible();
    await expect(page.getByText('Logged out')).toBeVisible(); // nobody got logged in
});
```

Full file: `e2e/register.spec.ts`.

### Checklist before you're done

- [ ] `await` in front of **every** Playwright line
- [ ] Locators a user can see (`getByLabel`, `getByRole`, `getByText`), with `exact: true` when the code snippets also contain the text
- [ ] Each test sets up its own start state (`beforeEach`), never counts on another test
- [ ] Green twice in a row (data that the test creates doesn't break the next run)
- [ ] You saw it go red once
- [ ] `npm run e2e` passes for the whole project

---

## 5. Cheat table: find things (locators)

Find elements **the way a user sees them** (text, label, role), not with CSS classes.

| Find...                    | Write                                          | Matches                                              |
| -------------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| A button                   | `page.getByRole('button', { name: 'Log in' })` | `<button>Log in</button>`                            |
| A link                     | `page.getByRole('link', { name: 'Home' })`     | `<a>Home</a>`                                        |
| A title                    | `page.getByRole('heading', { name: 'Index' })` | `<h1>`...`<h6>`                                      |
| A field by its label       | `page.getByLabel('Email')`                     | `<label for="email">Email</label><input id="email">` |
| A field by its placeholder | `page.getByPlaceholder('name123')`             | `<input placeholder="name123">`                      |
| Some text                  | `page.getByText('Welcome, Bob Martin!')`       | any element with that text                           |
| A test id                  | `page.getByTestId('cart')`                     | `<div data-testid="cart">`                           |
| CSS (last resort)          | `page.locator('#email')`                       |                                                      |

Add `{ exact: true }` to match the **whole** text only (by default, `'Log'` also matches `'Log in'`).

---

## 6. Cheat table: actions

| Do                        | Write                                    |
| ------------------------- | ---------------------------------------- |
| Open a page               | `await page.goto('/form/reactive-form')` |
| Click                     | `await locator.click()`                  |
| Type (replaces the value) | `await locator.fill('Bob')`              |
| Tick a checkbox / radio   | `await locator.check()`                  |
| Pick in a `<select>`      | `await locator.selectOption('male')`     |
| Press a key               | `await locator.press('Enter')`           |
| Go back                   | `await page.goBack()`                    |

---

## 7. Cheat table: checks (`expect`)

| Check              | Write                                                    |
| ------------------ | -------------------------------------------------------- |
| Is on screen       | `await expect(locator).toBeVisible()`                    |
| Is not on screen   | `await expect(locator).toBeHidden()`                     |
| Has this text      | `await expect(locator).toHaveText('Count: 1')`           |
| Contains this text | `await expect(locator).toContainText('Bob')`             |
| Field value        | `await expect(locator).toHaveValue('bob@email.bob')`     |
| Disabled / enabled | `await expect(locator).toBeDisabled()` · `toBeEnabled()` |
| Checked            | `await expect(locator).toBeChecked()`                    |
| How many           | `await expect(locator).toHaveCount(3)`                   |
| The URL            | `await expect(page).toHaveURL('/tests/e2e-test')`        |
| The tab title      | `await expect(page).toHaveTitle('My app')`               |

---

## 8. Run the tests

| Command                                        | What it does                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| `npm run e2e`                                  | Run all e2e tests (headless: no window)                                    |
| `npx playwright test --ui`                     | **UI mode**: see every step, re-run, time-travel. Best to learn and debug. |
| `npx playwright test --headed`                 | Watch the browser do it                                                    |
| `npx playwright test e2e/login.spec.ts`        | Only one file                                                              |
| `npx playwright test -g "wrong password"`      | Only tests whose name contains this                                        |
| `npx playwright show-report`                   | Open the HTML report of the last run                                       |
| `npx playwright codegen http://localhost:4200` | Click around in your app → Playwright **writes the test for you**          |

> 💡 Don't know how to find an element? Run `codegen`, click it, copy the line it writes.

---

## 🐛 Troubleshooting

### `Executable doesn't exist at .../ms-playwright/chromium-...`

The browsers aren't downloaded (or Playwright was updated). Run `npx playwright install`.

### `strict mode violation: getByText('...') resolved to 2 elements`

Your locator matches more than one thing. It happened on this demo page: the code snippet **also** contains the text "Wrong email or password". Fixes:

```ts
page.getByText('Wrong email or password', { exact: true }); // whole text only
page.getByRole('button', { name: 'Log in' }); // more precise
page.getByTestId('login-error'); // add data-testid="login-error" in the HTML
```

### `Timed out 5000ms waiting for expect(locator).toBeVisible()`

The element never appeared. Check, in this order:

1. The text / label is spelled **exactly** like on the page (open it with `--ui` and look).
2. The previous action worked (the button wasn't disabled? the form was valid?).
3. The page is the right one: `await expect(page).toHaveURL(...)`.

### `Timed out waiting 60000ms from config.webServer`

`ng serve` or the fake API didn't start in time. Run `npm run dev` yourself in another terminal and check both start without errors, then run the tests again (`reuseExistingServer: true` uses them).

### The tests open the wrong app

Another project is already running on port 4200, and `reuseExistingServer: true` uses it. Stop the other `ng serve` first.

### A test passes alone but fails with the others

Tests must not depend on each other. Each test starts in a **new** browser tab with nothing saved: do the login (or `goto`) again in each test or in `beforeEach`.

### `ng test` tries to run the Playwright files

They're in `src/`. Move them to the `e2e/` folder at the root.
