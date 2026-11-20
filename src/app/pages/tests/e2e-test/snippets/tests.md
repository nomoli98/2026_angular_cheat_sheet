```ts login.spec.ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    // start logged out
    await page.addInitScript(() => localStorage.setItem('auth-toggle', 'off'));
    await page.goto('/tests/e2e-test');
});

test('the button is disabled while the form is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Log in' })).toBeDisabled();
});

test('Bob can log in and log out', async ({ page }) => {
    // find by <label>
    await page.getByLabel('Email').fill('bob@email.bob');
    await page.getByLabel('Password').fill('BobIsTheBest99#');
    await page.getByRole('button', { name: 'Log in' }).click();

    // exact: whole text only
    await expect(page.getByText('Welcome, Bob Martin!', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Log out' }).click();

    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
});

test('a wrong password shows an error', async ({ page }) => {
    await page.getByLabel('Email').fill('bob@email.bob');
    await page.getByLabel('Password').fill('wrong');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText('Wrong email or password', { exact: true })).toBeVisible();
});
```

```ts navigation.spec.ts
import { test, expect } from '@playwright/test';

test('the home page shows the index', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Index' })).toBeVisible();
});

test('a link on the home page opens the e2e demo page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'E2E tests (Playwright)' }).click();

    await expect(page).toHaveURL('/tests/e2e-test');
    await expect(page.getByRole('heading', { name: 'E2E tests (Playwright)' })).toBeVisible();
});
```
