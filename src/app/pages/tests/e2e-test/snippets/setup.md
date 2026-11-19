```bash terminal
# 1. Add Playwright to the project
npm install -D @playwright/test

# 2. Download the browsers it drives (once per computer)
npx playwright install
```

```json package.json
"scripts": {
  "e2e": "playwright test"
}
```

```bash .gitignore
# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```
