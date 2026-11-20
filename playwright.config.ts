import { defineConfig, devices } from '@playwright/test';

// Docs: https://playwright.dev/docs/test-configuration
export default defineConfig({
  // not in src/: ng test skips them
  testDir: './e2e',

  use: {
    // page.goto('/x') → http://localhost:4200/x
    baseURL: 'http://localhost:4200',
    // on failure: npx playwright show-trace
    trace: 'retain-on-failure',
  },

  // add firefox / webkit here
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  // starts the servers, or reuses running ones
  webServer: [
    {
      command: 'npm run api',
      url: 'http://localhost:3000/people',
      reuseExistingServer: true,
    },
    {
      command: 'npm run api:auth', // auth server
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
