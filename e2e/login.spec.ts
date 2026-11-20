import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    // start logged out: the toggle logs Bob in by default
    await page.addInitScript(() => localStorage.setItem('auth-toggle', 'off'));
    await page.goto('/tests/e2e-test');
});

test('the button is disabled while the form is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Log in' })).toBeDisabled();
});

test('Bob can log in and log out', async ({ page }) => {
    // find the field by its <label>
    await page.getByLabel('Email').fill('bob@email.bob');
    await page.getByLabel('Password').fill('BobIsTheBest99#');
    await page.getByRole('button', { name: 'Log in' }).click();

    // exact: the snippet on the page has the same text
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
