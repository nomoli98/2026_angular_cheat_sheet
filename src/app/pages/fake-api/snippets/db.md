```json fake-api/db.json
{
  "people": [
    { "id": 1, "name": "Bob Martin", "email": "bob@email.bob", "role": "admin" },
    { "id": 2, "name": "Alice Dupont", "email": "alice.dupont@mail.com", "role": "user" }
  ]
}
```

```bash reset
# reset: copy the seed over db.json
npm run api:reset
```
