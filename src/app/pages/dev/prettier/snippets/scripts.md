```json package.json
"scripts": {
  "start": "ng serve",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "predev": "node scripts/ensure-fake-api.js && prettier --write . --log-level warn",
  "dev": "concurrently -k -n api,auth,ng \"npm:api\" \"npm:api:auth\" \"npm:start\""
}
```

```bash terminal
npm run dev           # formats everything, then starts API + auth + Angular
npm run format        # format everything, nothing else
npm run format:check  # only lists the files that aren't formatted (CI)
```
