import { test, expect } from '@playwright/test';

// Runs before each test: open the demo page
test.beforeEach(async ({ page }) => {
  // The auth toggle (navbar) logs Bob in by default: start logged OUT to test the form.
  // addInitScript runs before the app starts, so the toggle reads 'off'.
  await page.addInitScript(() => localStorage.setItem('auth-toggle', 'off'));
  await page.goto('/tests/e2e-test');
});

test('the button is disabled while the form is empty', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Log in' })).toBeDisabled();
});

test('Bob can log in and log out', async ({ page }) => {
  // Fill the form like a user: find the field by its <label>
  await page.getByLabel('Email').fill('bob@email.bob');
  await page.getByLabel('Password').fill('BobIsTheBest99#');
  await page.getByRole('button', { name: 'Log in' }).click();

  // exact: true → only the element whose WHOLE text is this
  // (the code snippet on the page also contains 'Welcome, Bob Martin!')
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
