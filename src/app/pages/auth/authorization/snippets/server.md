```js auth-server.js
// fake-api/auth-server.js
// 1. authentication (401)
async function authenticate(headers) {
  const auth = headers['authorization'] ?? '';
  if (!auth.startsWith('Bearer ')) return [null, [401, { message: 'no token' }]];
  let payload;
  try {
    payload = jwt.verify(auth.slice(7), JWT_SECRET); // signature + expiry
  } catch (err) {
    return [null, [401, { message: 'invalid token' }]];
  }
  // role from the DB
  const user = await data(`/${payload.sub}`).catch(() => null);
  if (!user) return [null, [401, { message: 'user not found' }]];
  return [user, null];
}

// 2. authorization (403)
async function users(headers) {
  const [user, error] = await authenticate(headers);
  if (error) return error;
  if (user.role !== 'admin') return [403, { message: 'forbidden' }];
  return [200, (await data('')).map(withoutPassword)];
}

// the router
if (route === 'GET /token/users') return send(await users(req.headers));
```

```ts token-auth.controller.ts
// core/controllers/token-auth.controller.ts
// checked here AND on the server
async getUsers(): Promise<UserResponse[]> {
  const user = this._authService.currentUser(); // from the token
  if (!isAdmin(user)) deny(user);
  return firstValueFrom(this._authService.getUsers()); // + Bearer token
}
```

```bash curl
# skip Angular
curl -H "Authorization: Bearer <alice's token>" http://localhost:3001/token/users
# {"message":"forbidden"}   (HTTP 403)
```
