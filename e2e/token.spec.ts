import { test, expect } from '@playwright/test';

// needs the auth server (started by playwright.config.ts)

test('a token login survives a refresh', async ({ page }) => {
    await page.goto('/auth/token/login');
    await page.getByRole('button', { name: 'Bob (admin)' }).click();
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page.locator('main').getByText('Logged in as Bob Martin')).toBeVisible();

    await page.reload(); // token in localStorage

    await expect(page.locator('main').getByText('Logged in as Bob Martin')).toBeVisible();
});

test('the protected route accepts my token and refuses a modified one', async ({ page }) => {
    await page.goto('/auth/token/explain');
    await page.getByRole('button', { name: 'Log in (1 hour token)' }).click();
    await expect(page.getByText(/Expires in \d+ s/)).toBeVisible(); // wait for the login

    await page.getByRole('button', { name: 'With my token' }).click();
    await expect(page.getByText('200 OK: Bob Martin (admin)')).toBeVisible();

    await page.getByRole('button', { name: 'With a modified token' }).click();
    await expect(page.getByText('401 Invalid token: the signature does not match')).toBeVisible();
});
