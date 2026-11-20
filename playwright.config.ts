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

  // Starts the fake API and `ng serve` before the tests, and stops them after.
  // If one is already running (e.g. `npm run dev`), Playwright uses it instead.
  webServer: [
    {
      command: 'npm run api',
      url: 'http://localhost:3000/people',
      reuseExistingServer: true,
    },
    {
      command: 'npm run api:auth', // the auth server (token pages): bcrypt + JWT
      url: 'http://localhost:3001/health',
      reuseExistingServer: true,
    },
    {
      command: 'npm start',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
    },
  ],
});
