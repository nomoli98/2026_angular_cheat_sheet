```json package.json
"scripts": {
  "start": "ng serve",
  "api": "json-server --watch fake-api/db.json --port 3000",
  "api:auth": "node fake-api/auth-server.js",
  "dev": "concurrently -k -n api,auth,ng -c cyan,yellow,magenta \"npm:api\" \"npm:api:auth\" \"npm:start\"",
  "api:reset": "node -e \"require('fs').copyFileSync('fake-api/db.seed.json','fake-api/db.json')\""
}
```

```bash terminal
npm run dev # API + auth + Angular
```
