```ts token-auth.service.ts
// core/services/token-auth.service.ts
// the server hashes
register(request: RegisterRequest): Observable<UserResponse> {
  return this._http.post<AuthResponse>(`${this._url}/register`, request).pipe(
    tap((res) => this._setToken(res.token)), // signal + localStorage
    map((res) => res.user),
  );
}
```

```js auth-server.js
// fake-api/auth-server.js (Node)
async function register(body) {
  const [taken] = await data(`?email=${encodeURIComponent(body.email ?? '')}`);
  if (taken) return [409, { message: 'email already taken' }];

  const password = await bcrypt.hash(String(body.password ?? ''), BCRYPT_ROUNDS); // 👈 server-side
  const user = await data('', { method: 'POST', body: { ...body, password, role: 'user' } });
  return [201, { token: sign(user), user: withoutPassword(user) }];
}
```

```ts register.component.ts
// only the controller changes:
protected readonly _authController = inject(TokenAuthController);
```
