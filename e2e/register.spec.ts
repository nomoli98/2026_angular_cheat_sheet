import { test, expect } from '@playwright/test';

// The worked example of E2E_TEST.md ("Step by step: write a test")

test.beforeEach(async ({ page }) => {
  // start logged OUT: the auth toggle in the navbar logs Bob in by default
  await page.addInitScript(() => localStorage.setItem('auth-toggle', 'off'));
  await page.goto('/auth/register');
});

test('a new user can register and is logged in', async ({ page }) => {
  // a new email on every run: the test really writes into db.json
  const email = `zoe.${Date.now()}@test.com`;

  // 1. fill the form like a user
  await page.getByLabel('Name').fill('Zoe Test');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('ZoeIsTheBest99#');
  await page.getByLabel('Birthdate').fill('1990-05-05');
  await page.getByLabel('I agree to the terms').check();
  await page.getByRole('button', { name: 'Register', exact: true }).click();

  // 2. check what the user sees
  await expect(page.getByText('Welcome, Zoe Test!')).toBeVisible();
  await expect(page.getByText('Logged in as Zoe Test')).toBeVisible(); // the navbar
});

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
