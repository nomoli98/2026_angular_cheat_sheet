# Angular 22 cheat sheet

> 📖 **Official docs:** [Angular documentation](https://angular.dev/overview)

Code snippets and step-by-step notes on how to do things in Angular 22, for when I forget.

Each topic is a folder in `src/app/pages/` with **working demo pages** and a **`.md` file** that explains them.

## Contents

| Topic                                                                                     | Doc                                                                    | Demo pages                                                                                                               |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Template**                                                                              |                                                                        |                                                                                                                          |
| ↳ Templates                                                                               | [TEMPLATE.md](src/app/pages/template/TEMPLATE.md)                      |                                                                                                                          |
| ↳ Binding: `{{ }}`, `[prop]`, `(event)`, `[(two-way)]`, `model()`                         | [BINDING.md](src/app/pages/template/binding/BINDING.md)                | `/template/static-binding`, `/template/responsive-binding`, `/template/event-binding`, `/template/two-way-binding`       |
| ↳ Syntax: `@if`, `@switch`, `@for`, `@let`, `@defer`                                      | [SYNTAX.md](src/app/pages/template/syntax/SYNTAX.md)                   | `/template/condition`, `/template/loop`                                                                                  |
| **Components**                                                                            |                                                                        |                                                                                                                          |
| ↳ Routing                                                                                 | [ROUTING.md](src/app/pages/routers/ROUTING.md)                         |                                                                                                                          |
| ↳ Basics: the 3 ways, links, params, redirects, 404                                       | [ROUTING.md](src/app/pages/routers/ROUTING.md)                         | `/router/basics`                                                                                                         |
| ↳ Sub-routing and named outlets                                                           | [SUB-ROUTING.md](src/app/pages/routers/SUB-ROUTING.md)                 | `/router/sub-outlet`                                                                                                     |
| ↳ Signal inputs: `input()`, `input.required()`, alias, transform                          | [INPUT.md](src/app/pages/input-output/input/INPUT.md)                  | `/input-output/input`                                                                                                    |
| ↳ Signal outputs: `output()`, `emit()`, alias, RxJS interop, `model()`                    | [OUTPUT.md](src/app/pages/input-output/output/OUTPUT.md)               | `/input-output/output`                                                                                                   |
| **Forms**                                                                                 | [FORM.md](src/app/pages/forms/FORM.md)                                 |                                                                                                                          |
| ↳ Template-driven                                                                         | [TEMPLATE_FORM.md](src/app/pages/forms/template-form/TEMPLATE_FORM.md) | `/form/template-form`                                                                                                    |
| ↳ Reactive                                                                                | [REACTIVE_FORM.md](src/app/pages/forms/reactive-form/REACTIVE_FORM.md) | `/form/reactive-form`                                                                                                    |
| ↳ Signal forms                                                                            | [SIGNAL_FORM.md](src/app/pages/forms/signal-form/SIGNAL_FORM.md)       | `/form/signal-form`                                                                                                      |
| **Application**                                                                           |                                                                        |                                                                                                                          |
| ↳ Auth: `AuthService`, route guard, auth toggle                                           | [AUTH_SERVICE.md](src/app/pages/auth/auth-service/AUTH_SERVICE.md)     | `/auth/auth-service`                                                                                                     |
| ↳ Register, login / logout (signal forms + `AuthController`)                              | [AUTH_SERVICE.md](src/app/pages/auth/auth-service/AUTH_SERVICE.md)     | `/auth/register`, `/auth/login`                                                                                          |
| ↳ Controllers: permissions (admin / yourself), Observable → Promise                       | [CONTROLLER.md](src/app/core/controllers/CONTROLLER.md)                |                                                                                                                          |
| ↳ CRUD pages: get all / one / me, update fully (PUT), update (PATCH), delete              | [CONTROLLER.md](src/app/core/controllers/CONTROLLER.md)                | `/service/get-all`, `/service/get-one`, `/service/get-me`, `/service/update-fully`, `/service/update`, `/service/delete` |
| **Security**                                                                              |                                                                        |                                                                                                                          |
| ↳ Same auth, password stored as a **bcrypt** hash                                         | [BCRYPT.md](src/app/pages/auth/bcrypt/BCRYPT.md)                       | `/auth/bcrypt/explain`, `/auth/bcrypt/register`, `/auth/bcrypt/login`                                                    |
| ↳ Same auth with a **JWT**: auth server, interceptor, protected route, survives a refresh | [TOKEN.md](src/app/pages/auth/token/TOKEN.md)                          | `/auth/token/explain`, `/auth/token/register`, `/auth/token/login`                                                       |
| **Theme**                                                                                 |                                                                        |                                                                                                                          |
| ↳ Bootstrap: install + use, how the pages are styled                                      | [BOOTSTRAP.md](src/app/pages/theme/bootstrap/BOOTSTRAP.md)             | `/theme/bootstrap`                                                                                                       |
| ↳ Dark mode: theme service + toggle                                                       | [THEME.md](src/app/pages/theme/dark-mode/THEME.md)                     | `/theme/dark-mode`                                                                                                       |
| **Dev**                                                                                   |                                                                        |                                                                                                                          |
| ↳ Fake API (json-server): people CRUD to practise services and `HttpClient`               | [FAKE-API.md](fake-api/FAKE-API.md)                                    | `/fake-api` (simple version), `http://localhost:3000/people` (start with `npm run dev`)                                  |
| ↳ Prettier: 4 spaces, single quotes, formats everything on `npm run dev`                  | [PRETTIER.md](src/app/pages/dev/prettier/PRETTIER.md)                  | `/dev/prettier`                                                                                                          |
| **Tests**                                                                                 | [TESTS.md](src/app/pages/tests/TESTS.md)                               |                                                                                                                          |
| ↳ Unit tests (Vitest): step by step, components, inputs/outputs, services, forms, mocks   | [UNIT_TEST.md](src/app/pages/tests/unit-test/UNIT_TEST.md)             | `/tests/unit-test`                                                                                                       |
| ↳ E2E tests (Playwright): install, config, step by step, locators, run                    | [E2E_TEST.md](src/app/pages/tests/e2e-test/E2E_TEST.md)                | `/tests/e2e-test`                                                                                                        |

The home page (`/`) links to every demo page: tabs by topic (`/?tab=forms`) and a search box.

## Run it

```bash
npm install
ng serve
```

Then open `http://localhost:4200/`.

### With the fake API

The pages that call a backend need the fake API too. Use this instead of `ng serve`:

```bash
npm run dev
```

It starts the fake API (`http://localhost:3000`), the auth server for the token pages (`http://localhost:3001`) **and** `ng serve` in one terminal. The first time, it installs `json-server@0.17.4` and `concurrently` if they're missing. **Ctrl+C** stops both. Details: [FAKE-API.md](fake-api/FAKE-API.md).

Before starting, `npm run dev` also formats the whole repo with Prettier (4 spaces, single quotes). Details: [PRETTIER.md](src/app/pages/dev/prettier/PRETTIER.md).

## How the project is organised

```
src/app/
├── app.routes.ts            one lazy-loaded entry per topic
├── pages/
│   ├── @index/              the home page: tabs + one list per tab + search (index-link.directive.ts hides the links that don't match)
│   ├── template/            template.routes.ts + binding/ + syntax/
│   ├── forms/               form.routes.ts + one folder per kind of form
│   ├── routers/             app.routes.example.ts, sub-outlet.routes.example.ts + the routing demos
│   ├── input-output/        input-output.routes.ts + input/ + output/
│   ├── theme/               theme.routes.ts + bootstrap/ (BOOTSTRAP.md) + dark-mode/ (THEME.md)
│   ├── auth/                auth.routes.ts (public) + auth-service/ + register/ + login/ + bcrypt/ + token/
│   ├── services/            service.routes.ts (protected by the guard) + the CRUD pages (get-all, get-one, get-me, update-fully, update, delete)
│   ├── dev/                 dev.routes.ts + prettier/ (PRETTIER.md)
│   ├── fake-api/            the fake API page (how json-server works + how to set one up)
│   └── tests/               tests.routes.ts + unit-test/ + e2e-test/
├── shared/
│   ├── code-snippet/        the code box (tabs + Copy button) shown on the demo pages
│   ├── auth-toggle/         the "logged in" switch in the navbar (demo: on = Bob, off = logged out)
│   └── theme-toggle/        the "Dark mode" switch in the navbar + ThemeService (see pages/theme/dark-mode/THEME.md)
└── core/
    ├── requests/            what we SEND to the API (register.request.ts → RegisterRequest)
    ├── responses/           what the services give BACK to the app, no password (user.response.ts → UserResponse)
    ├── enums/               gender.enum.ts, subscription.enum.ts, role.enum.ts
    ├── validators/          custom form validators: reactive-form/, template-form/, signal-form/
    ├── entities/            what json-server stores, password included (user.entity.ts → UserEntity)
    ├── mapper/              UserEntity → UserResponse (user.mapper.ts), removes the password
    ├── interceptors/        token.interceptor.ts: adds the JWT to the requests to the auth server
    ├── guards/              route guards (auth.guard.ts: not logged in → /auth/auth-service)
    ├── services/            HTTP calls, return Observables (auth, bcrypt-auth, token-auth, user), see fake-api/FAKE-API.md
    └── controllers/         check the permission (role), then call the service, return Promises (auth.controller.ts, user.controller.ts), see CONTROLLER.md
```

### Path aliases

`tsconfig.json` defines short import paths, so you don't count `../../../`:

| Alias       | Points to          |
| ----------- | ------------------ |
| `@core/*`   | `src/app/core/*`   |
| `@shared/*` | `src/app/shared/*` |
| `@pages/*`  | `src/app/pages/*`  |
| `@app/*`    | `src/app/*`        |

```ts
import { GenderEnum } from '@core/enums/gender.enum';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
```

Use `@core`, `@shared` and `@pages` in new code. Keep `./` for files in the same folder (child components, `snippets/*.md`).

`src/environments/` holds the settings that change between `ng serve` and `ng build`, like the API URL (`environment.apiUrl`).

The Playwright tests live outside `src/`, in `e2e/` at the root, with `playwright.config.ts`.

The fake API also lives at the root, outside `src/`:

```
fake-api/
├── db.seed.json             the original 10 people (never changed)
├── db.json                  the live data (changed by every POST/PUT/PATCH/DELETE)
└── FAKE-API.md
scripts/
└── ensure-fake-api.js       run by `npm run dev`: installs json-server + concurrently if missing
```

Each demo folder can have a `snippets/` folder with the code shown on the page.

Every topic's routes file exports its array as `routes`, and `app.routes.ts` lazy-loads it:

```ts
{
  path: 'template',
  loadChildren: () => import('./pages/template/template.routes').then((r) => r.routes),
},
```

## Adding a new topic

1. Create a folder in `src/app/pages/<topic>/`.
2. Generate the demo components inside it: `ng generate component pages/<topic>/<demo>`.
3. Create `<topic>.routes.ts` with `export const routes: Routes = [...]`, one `loadComponent` per demo.
4. Add the topic to `app.routes.ts` with `loadChildren` (like above).
5. Add the links to `pages/@index/index.component.html`. Start them with `/`, e.g. `routerLink="/<topic>/<demo>"`.
6. Write `<TOPIC>.md` next to the code and add it to the table above.
7. Add a code snippet to each section (see below).

## Adding a code snippet to a page

Each section of a demo page shows its code in a box with tabs and a **Copy** button, like the official docs.
The demo snippets have **no Bootstrap classes**, so you can copy them as-is into another project. The form snippets are the exception: they show the full form as it runs, Bootstrap classes included (see [BOOTSTRAP.md](src/app/pages/theme/bootstrap/BOOTSTRAP.md)).

**1. Write the snippet** in `<demo>/snippets/<name>.md`. Each code block becomes a tab. The text after the language is the tab name:

````md
```html condition.component.html
@if (isOpen()) {
<p>Open</p>
}
```

```ts condition.component.ts
isOpen = signal(false);
```
````

Languages you can use: `html`, `ts`, `css`, `json`, `bash`.

In the snippets, write imports with the aliases (`@core/...`, `@shared/...`), and leave out the snippet plumbing (`CodeSnippetComponent`, `import x from './snippets/x.md'`).

**2. Import it in the component** (the `.md` file is imported as a string, see `"loader"` in `angular.json`):

```ts
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import ifElse from './snippets/if-else.md';

@Component({
  imports: [CodeSnippetComponent],
  ...
})
export class ConditionComponent {
  protected readonly snippets = { ifElse };
}
```

**3. Show it** at the bottom of the section:

```html
<section class="card card-body mb-3">
    <h3>&#64;if</h3>
    ...demo...
    <app-code-snippet [code]="snippets.ifElse" />
</section>
```

> The snippet is a copy, not the real code. If you change the demo, update its snippet too.

## Other commands

| Command              | What it does                                                         |
| -------------------- | -------------------------------------------------------------------- |
| `npm run dev`        | Fake API + `ng serve` together                                       |
| `npm run api`        | Fake API only (`http://localhost:3000`)                              |
| `npm run api:slow`   | Fake API only, each answer waits 1 s (to test loading states)        |
| `npm run api:reset`  | Puts the original 10 people back in `fake-api/db.json`               |
| `ng build`           | Build into `dist/`                                                   |
| `ng test`            | Run the unit tests (Vitest)                                          |
| `npm run e2e`        | Run the e2e tests (Playwright). First time: `npx playwright install` |
| `ng generate --help` | List everything the CLI can generate                                 |
