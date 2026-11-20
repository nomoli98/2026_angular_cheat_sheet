# Tokens (JWT): bcrypt on the server + a signed token

> 📖 **Official docs:** [Angular: HTTP interceptors](https://angular.dev/guide/http/interceptors) · [jsonwebtoken (npm)](https://www.npmjs.com/package/jsonwebtoken) · [jwt.io: introduction](https://jwt.io/introduction)

Demo pages: `/auth/token/explain` (your token, decoded, + calls to a protected route), `/auth/token/register`, `/auth/token/login`

`TokenAuthService` does **the same job** as `BcryptAuthService` (see `../bcrypt/BCRYPT.md`): register, login, logout, who is logged in. Three things change:

| | `BcryptAuthService` | `TokenAuthService` |
| - | - | - |
| Who checks the password | Angular (`bcryptjs` in the browser) | the **server** (`fake-api/auth-server.js`) |
| What login gives back | the user | the user **+ a signed token (JWT)** |
| After a refresh | logged out (a signal in memory) | **still logged in** (token in `localStorage`) |
| Can the server protect a route? | no, it doesn't know who asks | yes: `GET /token/me` needs a valid token |

```
Angular ──▶ auth-server.js (localhost:3001) ──▶ json-server (localhost:3000) ──▶ db.json
            bcrypt.compare + jwt.sign/verify      /securePeople (same users as the bcrypt version)
```

---

## 1. What is a JWT?

Three base64url parts separated by dots: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 . eyJzdWIiOiIxIiwibmFtZSI6IkJvYi... . ICoAhqVi0qL97iIh...
{ "alg": "HS256", "typ": "JWT" }        { "sub": "1", "name": "Bob Martin",    HMAC(header.payload, SECRET)
                                          "role": "admin", "iat": ..., "exp": ... }
```

| Part | What it is | Who can read it | Who can make it |
| ---- | ---------- | --------------- | --------------- |
| header | the algorithm | anybody | anybody |
| payload | the data (`sub` = user id, `exp` = expiry in **seconds**) | **anybody**: it's only base64, not encrypted | anybody |
| signature | proof that the server made it | – | **only who has the secret** (the server) |

So: **never put a password or a secret in the payload**. And changing the payload (`"role": "admin"`) breaks the signature: the server refuses it (try it on the explain page).

---

## 2. Step by step: the server (`fake-api/auth-server.js`)

### Step 1. Install

```bash
npm install -D jsonwebtoken bcryptjs
```

### Step 2. Login: check the hash, sign a token

```js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET ?? 'demo-secret-change-me';

async function login(body) {
  const [user] = await data(`?email=${encodeURIComponent(body.email ?? '')}`);   // GET json-server
  const ok = user && (await bcrypt.compare(String(body.password ?? ''), user.password));
  if (!ok) return [401, { message: 'bad credentials' }];

  const payload = { sub: String(user.id), name: user.name, email: user.email, role: user.role };
  return [200, { token: jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }), user: withoutPassword(user) }];
}
```

`register` is the same idea: check the email, `bcrypt.hash()`, `POST` to json-server, sign a token.

### Step 3. Protect a route: verify the token

```js
async function me(headers) {
  const auth = headers['authorization'] ?? '';
  if (!auth.startsWith('Bearer ')) return [401, { message: 'no token' }];
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);   // signature + expiry
    return [200, withoutPassword(await data(`/${payload.sub}`))];
  } catch (err) {
    return [401, { message: err.name === 'TokenExpiredError' ? 'token expired' : 'invalid token' }];
  }
}
```

### Step 4. CORS

Angular (port 4200) calls port 3001: the browser first sends an `OPTIONS` request ("preflight"). Answer it, and allow the `Authorization` header:

```js
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
if (req.method === 'OPTIONS') return res.writeHead(204).end();
```

### Step 5. Start it with the rest

```json
"scripts": {
  "dev": "concurrently -k -n api,auth,ng -c cyan,yellow,magenta \"npm:api\" \"npm:api:auth\" \"npm:start\"",
  "api:auth": "node fake-api/auth-server.js"
}
```

> 💡 Why not inside json-server? Two programs writing the same `db.json` would overwrite each other. The auth server never touches the file: it asks json-server over HTTP, like a real auth service talks to a data service.

---

## 3. Step by step: Angular

### Step 1. The URL

```ts
// src/environments/environment.development.ts (and environment.ts)
export const environment = {
  apiUrl: 'http://localhost:3000',
  authUrl: 'http://localhost:3001',
};
```

### Step 2. The service: keep the token

```ts
@Service()
export class TokenAuthService {
  private readonly _token = signal<string | null>(readValidToken());   // from localStorage, on page load
  readonly token = this._token.asReadonly();

  readonly payload = computed(() => decodeToken(this._token()));       // read the middle part
  readonly currentUser = computed(() => {
    const p = this.payload();
    return p ? { id: Number(p.sub), name: p.name, email: p.email, role: p.role } : null;
  });

  login(request: LoginRequest): Observable<UserResponse> {
    return this._http.post<AuthResponse>(`${this._url}/login`, request).pipe(
      tap((res) => this._setToken(res.token)),    // signal + localStorage
      map((res) => res.user),
    );
  }

  logout(): void {
    this._setToken(null);   // the server keeps nothing: forgetting the token IS the logout
  }
}
```

`readValidToken()` throws away an **expired** token on start (`payload.exp * 1000 <= Date.now()`: `exp` is in seconds). Full file: `core/services/token-auth.service.ts`.

### Step 3. The interceptor: send the token

An interceptor is a function that runs for **every** `HttpClient` request. The services don't add any header themselves.

```ts
// core/interceptors/token.interceptor.ts
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(TokenAuthService);
  const token = auth.token();

  if (!token || !req.url.startsWith(environment.authUrl) || req.context.get(SKIP_TOKEN)) {
    return next(req);                       // not for us: send it as it is
  }

  const withToken = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });   // requests are immutable

  return next(withToken).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && !req.url.endsWith('/login')) {
        auth.logout();                      // the server refused our token → we're logged out
      }
      return throwError(() => err);         // the caller still gets the error
    }),
  );
};
```

| Line | Why |
| ---- | --- |
| `req.url.startsWith(environment.authUrl)` | **Never** send the token to another server (json-server, a CDN, someone else's API) |
| `req.clone({ setHeaders })` | A request can't be changed, only copied with changes |
| `SKIP_TOKEN` (an `HttpContextToken`) | Lets one request opt out: `{ context: new HttpContext().set(SKIP_TOKEN, true) }` |
| `!req.url.endsWith('/login')` | A 401 on login means "wrong password", not "your token died" |

### Step 4. Plug it in

```ts
// app.config.ts
provideHttpClient(withFetch(), withInterceptors([tokenInterceptor])),
```

Forget this and nothing errors: the header is just never sent, and every protected call answers `401 no token`.

### Step 5. Test it

- **Service** (`token-auth.service.spec.ts`): put a token in `localStorage` **before** `TestBed.inject(TokenAuthService)` (it reads it when it's created). Build fake tokens with `btoa(JSON.stringify(payload))`: the browser never checks the signature.
- **Interceptor** (`token.interceptor.spec.ts`): `provideHttpClient(withInterceptors([tokenInterceptor]))` + `provideHttpClientTesting()`, then check `req.request.headers.get('Authorization')`.

---

## 4. In a real app

| Topic | This demo | Real life |
| ----- | --------- | --------- |
| Secret | in the file | long random value from an environment variable, never in git |
| Where the token lives | `localStorage` | `localStorage` is readable by any script on the page (XSS). Many apps use an **httpOnly cookie** instead: JavaScript can't read it at all |
| Lifetime | 1 hour | short (5–15 min) + a **refresh token** to get a new one without logging in again |
| Logout | forget the token | same, but the token stays valid until `exp`: to kill it earlier the server needs a block list |
| Checking the role | the payload says `admin` | fine to show/hide buttons, but the **server** must check the role on every request |

---

## 🐛 Troubleshooting

### `The server is not reachable. Is the API running?` on the token pages

The auth server isn't running. `npm run dev` starts all three (api, auth, ng), or run `npm run api:auth` in another terminal. Port 3001 busy? See `EADDRINUSE` in `fake-api/FAKE-API.md`.

### `401 no token` even when logged in

- `withInterceptors([tokenInterceptor])` is missing in `app.config.ts`.
- The URL doesn't start with `environment.authUrl` (typo, `127.0.0.1` vs `localhost`), so the interceptor skips it.

### CORS error: `Request header field authorization is not allowed`

The server must list `Authorization` in `Access-Control-Allow-Headers` and answer the `OPTIONS` preflight.

### `invalid token` right after restarting the auth server

The secret changed (`JWT_SECRET` env var set differently): old tokens are signed with the old one. Log in again.

### Logged out after a refresh

- The token expired (`exp` passed): `readValidToken()` threw it away. Normal.
- `localStorage` is blocked (private mode, browser settings): the login only lasts until the refresh.

### `token expired` immediately

The computer's clock is wrong (`exp` is compared to the server's time), or you logged in with the 10-second token on the explain page.

### `atob` error / `decodeToken` returns `null`

A JWT is **base64url** (`-` and `_`, no `=` padding). Replace `-`→`+`, `_`→`/` and add the padding before `atob()` (see `decodeToken`).
