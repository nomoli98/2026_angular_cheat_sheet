```bash terminal
# run all
npm run e2e

# UI mode (best to learn)
npx playwright test --ui

# watch the browser
npx playwright test --headed

# one file
npx playwright test e2e/login.spec.ts

# HTML report
npx playwright show-report

# record a test
npx playwright codegen http://localhost:4200
```
