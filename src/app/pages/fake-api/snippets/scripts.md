```json package.json
"scripts": {
  "start": "ng serve",
  "api": "json-server --watch fake-api/db.json --port 3000",
  "dev": "concurrently -k -n api,ng \"npm:api\" \"npm:start\"",
  "api:reset": "node -e \"require('fs').copyFileSync('fake-api/db.seed.json','fake-api/db.json')\""
}
```

```bash terminal
npm run dev   # API on :3000 + Angular on :4200, Ctrl+C stops both
```
