```js auth-server.js
// fake-api/auth-server.js
// 1. AUTHENTICATION: who is calling? (401 if we can't tell)
async function authenticate(headers) {
  const auth = headers['authorization'] ?? '';
  if (!auth.startsWith('Bearer ')) return [null, [401, { message: 'no token' }]];
  let payload;
  try {
    payload = jwt.verify(auth.slice(7), JWT_SECRET); // signature + expiry
  } catch (err) {
    return [null, [401, { message: 'invalid token' }]];
  }
  // the role from the DATABASE: a demoted admin loses access right away
  const user = await data(`/${payload.sub}`).catch(() => null);
  if (!user) return [null, [401, { message: 'user not found' }]];
  return [user, null];
}

// 2. AUTHORIZATION: are you allowed? (403 if not)
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
// Checked in Angular (no useless request) AND by the server (the real check)
async getUsers(): Promise<UserResponse[]> {
  const user = this._authService.currentUser(); // read from the token payload
  if (!isAdmin(user)) deny(user);
  return firstValueFrom(this._authService.getUsers()); // GET /token/users + Bearer token
}
```

```bash curl
# Skip Angular completely: the server still says no
curl -H "Authorization: Bearer <alice's token>" http://localhost:3001/token/users
# {"message":"forbidden"}   (HTTP 403)
```
