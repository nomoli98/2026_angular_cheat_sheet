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
