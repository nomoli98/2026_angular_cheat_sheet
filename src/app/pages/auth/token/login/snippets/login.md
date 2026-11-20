```ts token-auth.service.ts
// core/services/token-auth.service.ts
login(request: LoginRequest): Observable<UserResponse> {
  return this._http.post<AuthResponse>(`${this._url}/login`, request).pipe(
    tap((res) => this._setToken(res.token)), // keep it: signal + localStorage
    map((res) => res.user),
  );
}

// WHO is logged in = what the token says (no extra request)
readonly payload = computed(() => decodeToken(this._token()));
readonly currentUser = computed(() => {
  const p = this.payload();
  return p ? { id: Number(p.sub), name: p.name, email: p.email, role: p.role } : null;
});

logout(): void {
  this._setToken(null); // that's all: the server keeps nothing (the token just expires)
}
```

```js auth-server.js
// fake-api/auth-server.js (Node)
async function login(body) {
  const [user] = await data(`?email=${encodeURIComponent(body.email ?? '')}`);
  const ok = user && (await bcrypt.compare(String(body.password ?? ''), user.password));
  if (!ok) return [401, { message: 'bad credentials' }];
  return [200, { token: sign(user), user: withoutPassword(user) }];
}

function sign(user, expiresIn = 3600) {
  const payload = { sub: String(user.id), name: user.name, email: user.email, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
```

```ts login.component.ts
// Same component as the other Login pages, only these change:
protected readonly _authController = inject(TokenAuthController);
protected readonly _currentUser = inject(TokenAuthService).currentUser;
```
