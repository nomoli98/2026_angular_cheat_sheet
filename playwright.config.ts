import { defineConfig, devices } from '@playwright/test';

// Docs: https://playwright.dev/docs/test-configuration
export default defineConfig({
  // Where the e2e tests are (NOT in src/, so `ng test` doesn't run them)
  testDir: './e2e',

  use: {
    // page.goto('/tests/e2e-test') → http://localhost:4200/tests/e2e-test
    baseURL: 'http://localhost:4200',
    // Record what happened when a test fails (open it with: npx playwright show-trace)
    trace: 'retain-on-failure',
  },

  // The browsers to test in. Add firefox / webkit here if you want.
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  // Starts `ng serve` before the tests, and stops it after.
  // If it's already running, Playwright uses it instead.
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
  },
});
