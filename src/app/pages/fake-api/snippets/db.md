```json fake-api/db.json
{
  "people": [
    { "id": 1, "name": "Bob Martin", "email": "bob@email.bob", "role": "admin" },
    { "id": 2, "name": "Alice Dupont", "email": "alice.dupont@mail.com", "role": "user" }
  ]
}
```

```bash reset
# fake-api/db.seed.json = same content, never touched by the API.
# Copy it over db.json to get the original data back:
npm run api:reset
```
