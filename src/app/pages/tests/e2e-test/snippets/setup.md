```bash terminal
# 1. install Playwright
npm install -D @playwright/test

# 2. download browsers (once)
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
