# Angular 22 cheat sheet

> 📖 **Official docs:** [Angular documentation](https://angular.dev/overview)

Code snippets and step-by-step notes on how to do things in Angular 22, for when I forget.

Each topic is a folder in `src/app/components/` with **working demo pages** and a **`.md` file** that explains them.

## Contents

| Topic | Doc | Demo pages |
|---|---|---|
| **Templates** | [TEMPLATE.md](src/app/components/template/TEMPLATE.md) | |
| ↳ Binding: `{{ }}`, `[prop]`, `(event)`, `[(two-way)]`, `model()` | [BINDING.md](src/app/components/template/binding/BINDING.md) | `/template/static-binding`, `/template/responsive-binding`, `/template/event-binding`, `/template/two-way-binding` |
| ↳ Syntax: `@if`, `@switch`, `@for`, `@let`, `@defer` | [SYNTAX.md](src/app/components/template/syntax/SYNTAX.md) | `/template/condition`, `/template/loop` |
| **Forms** | [FORM.md](src/app/components/forms/FORM.md) | |
| ↳ Template-driven | [TEMPLATE_FORM.md](src/app/components/forms/template-form/TEMPLATE_FORM.md) | `/form/template-form` |
| ↳ Reactive | [REACTIVE_FORM.md](src/app/components/forms/reactive-form/REACTIVE_FORM.md) | `/form/reactive-form` |
| ↳ Signal forms | [SIGNAL_FORM.md](src/app/components/forms/signal-form/SIGNAL_FORM.md) | `/form/signal-form` |
| **Routing** | [ROUTING.md](src/app/components/routers/ROUTING.md) | |
| ↳ Basics: the 3 ways, links, params, redirects, 404 | [ROUTING.md](src/app/components/routers/ROUTING.md) | `/router/basics` |
| ↳ Sub-routing and named outlets | [SUB-ROUTING.md](src/app/components/routers/SUB-ROUTING.md) | `/router/sub-outlet` |
| **Bootstrap** (install + use, how the pages are styled) | [BOOTSTRAP.md](BOOTSTRAP.md) | every page |
| **Fake API** (json-server): people CRUD to practise services and `HttpClient` | [FAKE-API.md](fake-api/FAKE-API.md) | `http://localhost:3000/people` (start with `npm run dev`) |
| **Input / Output** | | |
| ↳ Signal inputs: `input()`, `input.required()`, alias, transform | [INPUT.md](src/app/components/input-output/input/INPUT.md) | `/input-output/input` |
| ↳ Signal outputs: `output()`, `emit()`, alias, RxJS interop, `model()` | [OUTPUT.md](src/app/components/input-output/output/OUTPUT.md) | `/input-output/output` |
| **Tests** | [TESTS.md](src/app/components/tests/TESTS.md) | |
| ↳ Unit tests (Vitest): components, inputs/outputs, services, forms, mocks | [UNIT_TEST.md](src/app/components/tests/unit-test/UNIT_TEST.md) | `/tests/unit-test` |
| ↳ E2E tests (Playwright): install, config, locators, run | [E2E_TEST.md](src/app/components/tests/e2e-test/E2E_TEST.md) | `/tests/e2e-test` |

The home page (`/`) links to every demo page.

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

It starts the fake API (`http://localhost:3000`) **and** `ng serve` in one terminal. The first time, it installs `json-server@0.17.4` and `concurrently` if they're missing. **Ctrl+C** stops both. Details: [FAKE-API.md](fake-api/FAKE-API.md).

## How the project is organised

```
src/app/
├── app.routes.ts            one lazy-loaded entry per topic
├── components/
│   ├── @index/              the home page with all the links
│   ├── template/            template.routes.ts + binding/ + syntax/
│   ├── forms/               form.routes.ts + one folder per kind of form
│   ├── routers/             routing examples
│   ├── input-output/        input-output.routes.ts + input/ + output/
│   └── tests/               tests.routes.ts + unit-test/ + e2e-test/
├── shared/
│   └── code-snippet/        the code box (tabs + Copy button) shown on the demo pages
└── core/                    shared models, enums, factories, validators and services
```

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
  loadChildren: () => import('./components/template/template.routes').then((r) => r.routes),
},
```

## Adding a new topic

1. Create a folder in `src/app/components/<topic>/`.
2. Generate the demo components inside it: `ng generate component components/<topic>/<demo>`.
3. Create `<topic>.routes.ts` with `export const routes: Routes = [...]`, one `loadComponent` per demo.
4. Add the topic to `app.routes.ts` with `loadChildren` (like above).
5. Add the links to `components/@index/index.component.html`. Start them with `/`, e.g. `routerLink="/<topic>/<demo>"`.
6. Write `<TOPIC>.md` next to the code and add it to the table above.
7. Add a code snippet to each section (see below).

## Adding a code snippet to a page

Each section of a demo page shows its code in a box with tabs and a **Copy** button, like the official docs.
The snippets have **no Bootstrap classes**, so you can copy them as-is into another project.

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

**2. Import it in the component** (the `.md` file is imported as a string, see `"loader"` in `angular.json`):

```ts
import { CodeSnippetComponent } from '../../../../shared/code-snippet/code-snippet.component';
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

| Command | What it does |
|---|---|
| `npm run dev` | Fake API + `ng serve` together |
| `npm run api` | Fake API only (`http://localhost:3000`) |
| `npm run api:slow` | Fake API only, each answer waits 1 s (to test loading states) |
| `npm run api:reset` | Puts the original 10 people back in `fake-api/db.json` |
| `ng build` | Build into `dist/` |
| `ng test` | Run the unit tests (Vitest) |
| `npm run e2e` | Run the e2e tests (Playwright). First time: `npx playwright install` |
| `ng generate --help` | List everything the CLI can generate |
