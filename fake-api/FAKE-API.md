# Fake REST API (`json-server`), People CRUD

> 📖 **Official docs:** [json-server v0.17 README](https://github.com/typicode/json-server/tree/v0.17.4)

A fake backend that runs on `http://localhost:3000` so you can practise **services**, `HttpClient` and **CRUD** without writing a real server.
The data is a list of people shaped like `UserEntity` (`src/app/core/entities/user.entity.ts`), **password included**, exactly as stored in `db.json`.
The service removes the password and gives a `UserResponse`. The **controller** checks the logged-in user's role before calling the service (see `core/controllers/CONTROLLER.md`).

```
Component ─▶ UserController ─▶ UserService ─▶ json-server (localhost:3000) ◀──▶ fake-api/db.json
             (allowed? role)    (UserEntity → UserResponse,   (sends everything, password too)
                                 removes the password)
```

---

## 1. Files

```
my-angular-app/
├── fake-api/
│   ├── db.seed.json        ← the ORIGINAL 10 people. Never edited by the API.
│   ├── db.json             ← the LIVE data. Changed on every POST/PUT/PATCH/DELETE.
│   └── FAKE-API.md         ← this file
├── scripts/
│   └── ensure-fake-api.js  ← installs json-server + concurrently if missing
├── src/
└── package.json
```

---

## 2. `scripts/ensure-fake-api.js`

Runs automatically before `npm run dev`. It:
1. installs `json-server@0.17.4` and `concurrently` if they're **missing** (or json-server is the **wrong version**),
2. creates `fake-api/db.json` from `db.seed.json` if it doesn't exist yet.

```js
// Runs automatically before `npm run dev` (via the "predev" script).
// Installs json-server@0.17.4 and concurrently if they are missing or on the wrong version.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const wanted = {
  'json-server': '0.17.4', // pinned: 1.0 beta works differently (see troubleshooting)
  concurrently: null, // null = any version is fine
};

function installedVersion(pkg) {
  const file = path.join(process.cwd(), 'node_modules', pkg, 'package.json');
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8')).version;
}

const missing = Object.entries(wanted)
  .filter(([pkg, version]) => {
    const current = installedVersion(pkg);
    return current === null || (version !== null && current !== version);
  })
  .map(([pkg, version]) => (version ? `${pkg}@${version}` : pkg));

if (missing.length === 0) {
  console.log('[fake-api] json-server + concurrently already installed ✔');
} else {
  console.log(`[fake-api] Installing: ${missing.join(' ')}`);
  execSync(`npm install -D ${missing.join(' ')}`, { stdio: 'inherit' });
}

// Create db.json from the seed the first time (db.json is the live data).
const db = path.join('fake-api', 'db.json');
const seed = path.join('fake-api', 'db.seed.json');
if (!fs.existsSync(db) && fs.existsSync(seed)) {
  fs.copyFileSync(seed, db);
  console.log('[fake-api] Created fake-api/db.json from db.seed.json');
}
```

> 💡 It's a `.js` file (not `.ts`) so Node runs it directly, no compile step. If your `package.json` has `"type": "module"`, rename it `ensure-fake-api.cjs` and update the `predev` script.

---

## 3. Add the scripts to `package.json`

```json
"scripts": {
  "start": "ng serve",
  "predev": "node scripts/ensure-fake-api.js",
  "dev": "concurrently -k -n api,ng -c cyan,magenta \"npm:api\" \"npm:start\"",
  "api": "json-server --watch fake-api/db.json --port 3000",
  "api:slow": "json-server --watch fake-api/db.json --port 3000 --delay 1000",
  "api:reset": "node -e \"require('fs').copyFileSync('fake-api/db.seed.json','fake-api/db.json')\""
}
```

| Script | What it does |
| ------ | ------------ |
| `npm run dev` | ⭐ **Use this.** Checks/installs, then starts the API **and** `ng serve` in one terminal |
| `predev` | Runs **by itself** before `dev` (npm runs `preXxx` before `xxx`). Never call it directly. |
| `npm start` | Angular only (as before) |
| `npm run api` | API only, on port 3000 |
| `npm run api:slow` | API only, every answer waits 1 s → to test loading spinners |
| `npm run api:reset` | Puts the 10 original people back in `db.json` |

What the `concurrently` flags mean:

| Flag | Meaning |
| ---- | ------- |
| `-k` | **k**ill the other one if one stops (if `ng serve` crashes, the API stops too) |
| `-n api,ng` | **n**ames shown before each log line: `[api] ...` / `[ng] ...` |
| `-c cyan,magenta` | **c**olors of those names |
| `"npm:api"` | shortcut for `npm run api` |

> The scripts are the same on **Windows (PowerShell / cmd)** and **Mac / Linux**: npm runs them, and everything inside is Node, so no OS-specific commands.

---

## 4. Run it

```bash
npm run dev
```

First time you'll see:

```
[fake-api] Installing: json-server@0.17.4 concurrently
...
[fake-api] Created fake-api/db.json from db.seed.json
[ng]  ➜  Local:   http://localhost:4200/
[api]   Resources
[api]   http://localhost:3000/people
```

Next times: `[fake-api] json-server + concurrently already installed ✔`, then both start.

- Stop both: **Ctrl+C** once (PowerShell may ask `Terminate batch job (Y/N)?` → `Y`).
- Check the API: open <http://localhost:3000/people> → you should see the JSON list.

### Manual install (if you prefer)

```bash
npm install -D json-server@0.17.4 concurrently
```

> ⚠️ Keep the `@0.17.4`. A plain `npm install json-server` installs the **1.0 beta**, which works differently (string ids, other query params).

---

## 5. The data model

One person in `db.json`:

```json
{
  "id": 1,
  "name": "Bob Martin",
  "email": "bob@email.bob",
  "password": "BobIsTheBest99#",
  "birthdate": "2000-09-22",
  "height": 195,
  "gender": "male",
  "subscription": "premium",
  "agreeToTerms": true,
  "role": "admin"
}
```

The matching types are in `src/app/core/`:

| File | Type | Who uses it | Password? |
| ---- | ---- | ----------- | --------- |
| `entities/user.entity.ts` | `UserEntity` | what the **API** sends back (`GET`, and the answer to `POST`/`PUT`/`PATCH`). Only the **service** sees it. | ✅ yes |
| `responses/user.response.ts` | `UserResponse` | what the **service** gives to components | ❌ no |
| `requests/register.request.ts` | `RegisterRequest` | what you **send** to create a person (`POST`) or replace one (`PUT`) | ✅ yes |

```
          sends                    API returns              service returns
RegisterRequest ──POST/PUT──▶  UserEntity  ──(remove password)──▶  UserResponse
```

```ts
// src/app/core/entities/user.entity.ts
// The person EXACTLY as json-server stores and returns it. Only the service uses this.
import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';
import { RoleEnum } from '@core/enums/role.enum';

export interface UserEntity {
  id: number; // json-server gives every person an id
  name: string;
  email: string;
  password: string;           // ⚠️ json-server sends it back. Never let it leave the service.
  birthdate: string;          // ⚠️ JSON has no Date type → ISO string "YYYY-MM-DD"
  height: number;
  gender: GenderEnum;
  subscription: SubscriptionEnum;
  agreeToTerms: boolean;
  role: RoleEnum;             // 'admin' | 'user', see core/controllers/CONTROLLER.md
}
```

```ts
// src/app/core/responses/user.response.ts
// What the service gives to components: the entity WITHOUT the password.
import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';
import { RoleEnum } from '@core/enums/role.enum';

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  birthdate: string;
  height: number;
  gender: GenderEnum;
  subscription: SubscriptionEnum;
  role: RoleEnum;
}
```

```ts
// src/app/core/mapper/user.mapper.ts
// UserEntity → UserResponse: copies only the fields components may see.
export function UserMapper(user: UserEntity): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    birthdate: user.birthdate,
    height: user.height,
    gender: user.gender,
    subscription: user.subscription,
    role: user.role,
  };
}
```

> 💡 Short alternative: `export type UserResponse = Omit<UserEntity, 'password'>;` = "all the fields of `UserEntity` except `password`".

```ts
// src/app/core/requests/register.request.ts
import { GenderEnum } from '@core/enums/gender.enum';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  birthdate: string;
  height: number;
  gender: GenderEnum;
  subscription: 'free' | 'premium';
  agreeToTerms: boolean;
}
```

> 💡 Every person has a password of the form `<FirstName>IsTheBest99#` (`BobIsTheBest99#`, `AliceIsTheBest99#`...), so it passes the strong-password validator. json-server sends the `password` back in every answer, that's why `UserEntity` has it and the service has to remove it. A real API would never send it back at all.

> 💡 **Roles:** Bob is `"admin"`, everybody else is `"user"`. New accounts are always `"user"`: `UserService.create` adds `role: RoleEnum.USER` to the request (`RegisterRequest` has no role, a user can't choose to be admin).

> ⚠️ `"gender"` in `db.json` must be the **values** of `GenderEnum` (`'male'`, `'female'`, `'other'`), not the keys (`MALE`...). If you edit the JSON by hand, keep them lowercase.

---

## 6. CRUD endpoints

Base URL: `http://localhost:3000/people`

What **json-server** returns (the service then turns every `UserEntity` into a `UserResponse`):

| Action | Method | URL | Body | API returns |
| ------ | ------ | --- | ---- | ----------- |
| **Read** all | `GET` | `/people` | – | `UserEntity[]` |
| **Read** one | `GET` | `/people/1` | – | `UserEntity` (or `404`) |
| **Create** | `POST` | `/people` | `RegisterRequest` (no id) + `role: 'user'` | the new `UserEntity` with its `id` |
| **Update** (replace everything) | `PUT` | `/people/1` | full `RegisterRequest` + the current `role` | updated `UserEntity` |
| **Update** (only some fields) | `PATCH` | `/people/1` | `Partial<RegisterRequest>` e.g. `{ "subscription": "premium" }` | updated `UserEntity` |
| **Delete** | `DELETE` | `/people/1` | – | `{}` |
| **Log in** (fake) | `GET` | `/people?email=bob@email.bob` | – | `[UserEntity]` if the email exists, `[]` if not. The **service** then checks the password. |
| **Exists?** (id) | `GET` | `/people?id=1` | – | `[UserEntity]` or `[]` → `UserService.exists(id)` turns it into `true` / `false` |
| **Exists?** (email) | `GET` | `/people?email=bob@email.bob` | – | `[UserEntity]` or `[]` → `UserService.emailExists(email)` turns it into `true` / `false` |

- `POST` → the `id` is **auto-generated** (next number). Don't send one.
- **Booleans:** json-server can't answer `true`/`false`. Use a **filter** (`?id=` / `?email=`): it always answers an array, never a `404`, and the service maps it: `users.length > 0`.
- **Checks before writing** (in the services):
  - `AuthService.register()` → `emailExists` first, errors with `email already taken` instead of creating a duplicate.
  - `UserService.updateFully` / `updatePartial` / `delete` → `exists(id)` first, errors with `user not found` and sends nothing.
- `PUT` → fields you don't send are **deleted**. Use `PATCH` to change only one field. That's why `updateFully` reads the user first and sends their `role` back.
- Body requests need the header `Content-Type: application/json` (`HttpClient` adds it for you).
- **Log in:** json-server has no login, so `AuthService.login()` does it in 2 steps:
  1. asks json-server for the person with that email: `GET /people?email=...` → `[user]` or `[]`,
  2. compares the password **in the service**: no user or wrong password → the Observable errors with `bad credentials`, otherwise it returns the `UserResponse` (no password) and fills `currentUser`.

```ts
// src/app/core/services/auth.service.ts
login(request: LoginRequest): Observable<UserResponse> {
  return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
    map((users) => {
      const user = users[0];
      if (!user || user.password !== request.password) throw new Error('bad credentials');
      return UserMapper(user);
    }),
    tap((user) => this._currentUser.set(user)),
  );
}
```

> 💡 Use `params` (not `` `${url}?email=${email}` ``): Angular encodes special characters for you (`+`, `#`, `&`...). And the password never goes in the URL.

> ⚠️ Only for a fake API. A real API logs you in with `POST /login` and the password in the **body**, never in the URL (URLs end up in logs and in the browser history).

---

## 7. Bonus: filter, search, sort, paginate

All with `GET /people?...`. Combine them with `&`.

| Need | URL |
| ---- | --- |
| Filter by field | `/people?subscription=premium` |
| Several values | `/people?gender=male&gender=other` |
| Full-text search (all fields) | `/people?q=alice` |
| Contains (one field) | `/people?name_like=ali` |
| Greater / lower than | `/people?height_gte=180` / `/people?height_lte=160` |
| Not equal | `/people?gender_ne=male` |
| Sort | `/people?_sort=height&_order=desc` |
| First N results | `/people?_limit=3` |
| Pagination | `/people?_page=2&_limit=3` |

With `_page`, the total number of people is in the **response header** `X-Total-Count` (useful for "page 2 of 4").

---

## 8. Use it from Angular (setup)

### 8.1 Enable `HttpClient`, in `app.config.ts`

Already done in this repo: `provideHttpClient` sits next to the other providers.

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // HttpClient for the services (withFetch: uses the browser's fetch() API)
    provideHttpClient(withFetch()),   // 👈 DON'T FORGET THIS
  ],
};
```

> Forgot it? → `NullInjectorError: No provider for HttpClient!`

### 8.2 Keep the URL in one place

Already done in this repo, with the CLI:

```bash
ng generate environments
```

It creates two files and adds a `fileReplacements` to `angular.json`:

| File | Used by |
| ---- | ------- |
| `src/environments/environment.ts` | `ng build` (production) |
| `src/environments/environment.development.ts` | `ng serve` (replaces the other one) |

Both must export the same properties:

```ts
// src/environments/environment.development.ts
export const environment = {
  apiUrl: 'http://localhost:3000', // the fake API (json-server)
};
```

Import it from the file that is always there, `environment.ts`. Angular swaps it for you.

### 8.3 The services

| File | What it does |
| ---- | ------------ |
| `core/services/user.service.ts` | CRUD on `/people`: `create`, `getAll`, `getOne`, `updateFully` (PUT), `updatePartial` (PATCH), `delete`, plus the booleans `exists(id)` and `emailExists(email)` |
| `core/services/auth.service.ts` | `register` (refuses a taken email, then `UserService.create`), `login`, `logout`, `currentUser` signal |
| `core/validators/reactive-form/email-taken.validator.ts` | async validator: `emailExists` while the user types (see `REACTIVE_FORM.md`) |
| `core/mapper/user.mapper.ts` | `UserMapper(entity)` → `UserResponse` (removes the password). A plain function: call it, don't `inject()` it |
| `core/controllers/*.controller.ts` | what **components** call: check the logged-in user's role, then call the service and return a **Promise** (`firstValueFrom`), or throw `unauthorized` / `forbidden` (see `core/controllers/CONTROLLER.md`) |

All **service** methods return **Observables**: nothing is sent until you `.subscribe()` (or `firstValueFrom()` / `toSignal()`). The **controllers** return Promises: `await controller.getAll()`.

How a boolean + a check chain together (`switchMap` = "when the first answer arrives, start the second request"):

```ts
// UserService
exists(id: number): Observable<boolean> {
  return this._http.get<UserEntity[]>(this._url, { params: { id } }).pipe(map((users) => users.length > 0));
}

delete(id: number): Observable<void> {
  return this.ifExists(id, () => this._http.delete<void>(`${this._url}/${id}`));
}

private ifExists<T>(id: number, request: () => Observable<T>): Observable<T> {
  return this.exists(id).pipe(
    switchMap((found) => (found ? request() : throwError(() => new Error('user not found')))),
  );
}
```

---

## 9. Quick test without Angular (curl)

```bash
curl http://localhost:3000/people/1

curl -X POST http://localhost:3000/people \
  -H "Content-Type: application/json" \
  -d '{"name":"New Guy","email":"new@mail.com","password":"NewGuyIsTheBest99#","birthdate":"2000-01-01","height":170,"gender":"other","subscription":"free","agreeToTerms":true,"role":"user"}'

curl -X PATCH http://localhost:3000/people/1 \
  -H "Content-Type: application/json" \
  -d '{"subscription":"free"}'

curl -X DELETE http://localhost:3000/people/1
```

> PowerShell: use `curl.exe` (not `curl`) or the **REST Client** / **Thunder Client** VS Code extension.

> curl talks to json-server directly, so you'll see the **`UserEntity`** (with password).

---

## 🐛 Troubleshooting

### `ERR_CONNECTION_REFUSED` / `Http failure response ... 0 Unknown Error`

The API isn't running. You probably used `npm start` / `ng serve` → use `npm run dev` (or `npm run api` in a second terminal).

### `NullInjectorError: No provider for HttpClient!`

`provideHttpClient(withFetch())` is missing from `app.config.ts` (see 8.1).

### `'concurrently' is not recognized` / `concurrently: command not found`

`predev` didn't run. Check:
1. The script is called exactly `predev` (same name as `dev` + `pre`).
2. You use **npm**. `pnpm` skips `pre` scripts by default → run `node scripts/ensure-fake-api.js` once by hand, or just `npm install -D json-server@0.17.4 concurrently`.
3. npm's `ignore-scripts` isn't on: `npm config get ignore-scripts` must say `false`.

### `ReferenceError: require is not defined in ES module scope`

Your `package.json` has `"type": "module"`. Rename the script to `scripts/ensure-fake-api.cjs` and change `predev` to `node scripts/ensure-fake-api.cjs`.

### Angular logs are hard to read with the API logs mixed in

Run them in two terminals instead: `npm run api` + `npm start`. Or hide the API's logs: `concurrently -k --raw ...` removes prefixes, `concurrently -k --hide api ...` hides the API's output.

### `EADDRINUSE: address already in use :::3000`

Something already uses port 3000 (often an old json-server that didn't stop). Close the other terminal, or kill it:

```bash
# PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
# Mac / Linux
kill $(lsof -t -i:3000)
```

Or use another port: `--port 3001` (and change `apiUrl` in both `src/environments/` files).

### My data is messed up / people disappeared

That's normal: the API writes into `db.json`. Run:

```bash
npm run api:reset
```

### The ids are strings like `"a3f9"` and `_limit` / `_like` don't work

You installed json-server **1.0 beta**. `npm run dev` fixes it by itself (the check script sees the wrong version and reinstalls 0.17.4). Or by hand:

```bash
npm uninstall json-server
npm install -D json-server@0.17.4
```

### `404 Not Found` on `/person` or `/People`

The URL must match the key in `db.json` exactly: `"people"` → `/people` (lowercase, plural).

### `ng serve` reloads the page every time I save data

Only if `db.json` is inside `src/`. Keep it in `fake-api/` at the root.

### CORS error

json-server allows CORS by default. If you still see one, check the URL in `apiUrl` (`http://`, not `https://`, and the right port).
