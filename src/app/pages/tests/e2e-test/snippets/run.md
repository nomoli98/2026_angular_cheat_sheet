```bash terminal
# Run all the e2e tests (starts ng serve if it isn't running)
npm run e2e

# Open the UI mode: see each step, re-run, time-travel (best to learn!)
npx playwright test --ui

# Watch the browser do it
npx playwright test --headed

# Only one file
npx playwright test e2e/login.spec.ts

# Open the HTML report of the last run
npx playwright show-report

# Click around in your app and Playwright writes the test for you
npx playwright codegen http://localhost:4200
```
