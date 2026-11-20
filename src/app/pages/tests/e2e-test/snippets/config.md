```ts playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

// Docs: https://playwright.dev/docs/test-configuration
export default defineConfig({
    // not in src/
    testDir: './e2e',

    use: {
        // page.goto base URL
        baseURL: 'http://localhost:4200',
        // trace on failure
        trace: 'retain-on-failure',
    },

    // browsers
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

    // starts or reuses servers
    webServer: [
        {
            command: 'npm run api',
            url: 'http://localhost:3000/people',
            reuseExistingServer: true,
        },
        {
            command: 'npm start',
            url: 'http://localhost:4200',
            reuseExistingServer: true,
        },
    ],
});
```
