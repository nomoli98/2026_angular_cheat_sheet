# bcrypt: store a hash, not the password

> 📖 **Official docs:** [bcryptjs (npm)](https://www.npmjs.com/package/bcryptjs) · [OWASP: Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

Demo pages: `/auth/bcrypt/explain` (hash and compare live), `/auth/bcrypt/register`, `/auth/bcrypt/login`

`BcryptAuthService` does **exactly the same job** as `AuthService` (see `../auth-service/AUTH_SERVICE.md`), with one change: the password is stored as a **bcrypt hash**.

| | `AuthService` | `BcryptAuthService` |
| - | - | - |
| Users in | `/people` | `/securePeople` (same 10 people) |
| Register stores | `"password": "BobIsTheBest99#"` | `"password": "$2b$10$xScy...MRS"` |
| Login checks | `user.password !== typed` | `await compare(typed, user.password)` |
| Controller | `AuthController` | `BcryptAuthController` |

> ⚠️ **Demo only.** Here bcrypt runs **in the browser**, so you can see it work with json-server. In a real app the browser sends the password over **HTTPS** and the **server** hashes / compares it: the hash never comes back to the browser. The token version (`../token/TOKEN.md`) does it the real way.

---

## 1. Hash vs encryption

| | Encryption | Hash (bcrypt) |
| - | - | - |
| Can you get the password back? | yes, with the key | **no**, never |
| To check a login | decrypt, compare | hash the typed password the same way, compare |
| If the database leaks | the key leaks too → every password | only hashes, very slow to guess |

bcrypt adds two things a simple hash (SHA-256...) doesn't have:

- **Salt**: random characters mixed in and **saved inside the hash**. Same password → different hash every time. Two users with `123456` don't look the same, and pre-computed tables of hashes are useless.
- **Cost**: bcrypt repeats its work `2^cost` times. Cost 10 ≈ 100 ms: nothing for one login, a nightmare for someone trying billions of guesses. +1 = twice slower.

```
$2b$10$xScyLRoTzCndQZvGgrzwquFPmyRK0V9fja7/TukOT1j7IXedYJMRS
 │   │  └──────── salt (22) ────────┘└──────── hash (31) ────────┘
 │   └ cost
 └ algorithm (2b = bcrypt)
```

---

## 2. Step by step: add bcrypt to an auth service

### Step 1. Install

```bash
npm install bcryptjs
```

`bcryptjs` is pure JavaScript (browser **and** Node, types included). The `bcrypt` package is native C++: **Node only**, it won't build in Angular.

### Step 2. Hash on register

`hash()` returns a **Promise**. In an Observable chain, `switchMap` accepts an `async` function: its result becomes the next value.

```ts
import { hash } from 'bcryptjs';

export const BCRYPT_ROUNDS = 10;

register(request: RegisterRequest): Observable<UserResponse> {
  return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
    switchMap(async (users) => {
      if (users.length > 0) throw new Error('email already taken'); // a throw → the Observable errors
      return hash(request.password, BCRYPT_ROUNDS);
    }),
    switchMap((passwordHash) =>
      this._http.post<UserEntity>(this._url, { ...request, password: passwordHash, role: RoleEnum.USER }),
    ),
    map((user) => UserMapper(user)),            // the mapper drops the hash, like it dropped the password
    tap((user) => this._currentUser.set(user)),
  );
}
```

### Step 3. Compare on login

```ts
import { compare } from 'bcryptjs';

login(request: LoginRequest): Observable<UserResponse> {
  return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
    switchMap(async ([user]) => {
      if (!user || !(await compare(request.password, user.password))) {
        throw new Error('bad credentials');   // same error for "no user" and "wrong password"
      }
      return UserMapper(user);
    }),
    tap((user) => this._currentUser.set(user)),
  );
}
```

`compare()` reads the salt and the cost **from the stored hash**, hashes the typed password with them, and compares. That's why you never store the salt anywhere else.

### Step 4. Hash the existing passwords

Old accounts still have plain passwords. Hash them once (this repo did it with a Node one-liner when it created `securePeople`):

```bash
node -e "
const bcrypt = require('bcryptjs'), fs = require('fs');
const db = JSON.parse(fs.readFileSync('fake-api/db.seed.json', 'utf8'));
db.securePeople = db.people.map((p) => ({ ...p, password: bcrypt.hashSync(p.password, 10) }));
fs.writeFileSync('fake-api/db.seed.json', JSON.stringify(db, null, 2) + '\n');
"
```

### Step 5. Test it

bcrypt is slow, and `hash()` / `compare()` are async. Two tricks (see `core/services/bcrypt-auth.service.spec.ts`):

```ts
// 1. Fake users hashed with cost 4: same check, ~1 ms instead of ~100
const bob: UserEntity = { ...bobData, password: hashSync('BobIsTheBest99#', 4) };

// 2. The POST is sent AFTER hash() finishes → wait for it instead of expectOne right away
httpTesting.expectOne((r) => r.method === 'GET').flush([]);
const post = await waitForRequest(httpTesting, 'POST');
expect(await compare('ZoeIsTheBest99#', post.request.body.password)).toBe(true);
```

---

## 3. In a real app

| Do | Why |
| -- | --- |
| Hash on the **server** | The browser can be modified; the server is the only place you control |
| Send the password over **HTTPS**, in the **body** of a `POST` | Never in a URL (logs, history) |
| Cost **10 to 12** | Aim for ~100–250 ms per hash on your server; raise it over the years |
| Same error for "unknown email" and "wrong password" | Don't tell an attacker which emails exist |
| Passwords up to **72 bytes** | bcrypt ignores the rest. Set a max length on the form (or use Argon2) |

---

## 🐛 Troubleshooting

### `compare()` is always `false` even with the right password

- You compared strings: `(await hash(typed, 10)) === stored` is always false (new salt every time). Use `compare(typed, stored)`.
- The stored value isn't a bcrypt hash (an old plain password): it must start with `$2a$`, `$2b$` or `$2y$`.
- Arguments swapped: it's `compare(plainPassword, hash)`, plain first.

### `Illegal arguments: undefined, string`

The user has no `password` field (wrong list? `/people` vs `/securePeople`), or the form sent `undefined`.

### Build error with the `bcrypt` package (`fs`, `crypto`, `node-gyp`...)

`bcrypt` is native Node. In Angular use `bcryptjs`: `npm uninstall bcrypt && npm install bcryptjs`.

### Login takes ~1 second / the tests are slow

Cost too high for this machine. 10 in the app, **4 in the tests** (`hashSync(pw, 4)`): `compare()` reads the cost from the hash.

### `Expected one matching request ..., found none` in the register test

The POST is sent after `hash()` finishes, a few ms later. Wait for it (`waitForRequest` in the spec) instead of calling `expectOne` right away.
