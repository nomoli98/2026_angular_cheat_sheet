# Routing in Angular 22: the basics

> 📖 **Official docs:** [Routing overview](https://angular.dev/guide/routing) · [Define routes](https://angular.dev/guide/routing/define-routes) · [Route loading strategies](https://angular.dev/guide/routing/loading-strategies)

How to tell the router **which component to show for which URL**, and **when its code is downloaded**.

Files: `app.routes.ts`, `app.config.ts`, `pages/routers/app.routes.example.ts`

Sub-routing (a component with its own `<router-outlet>`, named outlets) has its own file: [SUB-ROUTING.md](./SUB-ROUTING.md).

Demo page: `/router/basics` (the 3 ways, links, params, redirect and 404, each with its code)

---

## 1. Give the routes to the app

```ts
// app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: route params (:id) and query params go into the component's input()
    provideRouter(routes, withComponentInputBinding()),
  ],
};
```

Useful options for `provideRouter(routes, ...)`:

| Option | What it does |
|---|---|
| `withComponentInputBinding()` | Route params (`:id`), query params and route `data` go straight into the component's `input()` |
| `withHashLocation()` | URLs look like `/#/form` (for servers that can't redirect everything to `index.html`) |
| `withInMemoryScrolling({ scrollPositionRestoration: 'top' })` | Scroll back to the top when you change page |

## 2. Put a `<router-outlet>` where the page should appear

```html
<!-- app.html -->
<router-outlet />
```

```ts
// app.ts
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  ...
})
```

The router renders the matched component **right after** `<router-outlet />`. Anything around it (a header or a nav) stays on screen on every page.

## 3. The three ways to point a route at code

```ts
// pages/routers/app.routes.example.ts
export const routes: Routes = [
  // 1. component: eager
  { path: '', component: IndexComponent },

  // 2. loadComponent: lazy, ONE component
  {
    path: 'loaded',
    loadComponent: () => import('../@index/index.component').then((m) => m.IndexComponent),
  },

  // 3. loadChildren: lazy, a whole Routes array
  {
    path: 'routes',
    loadChildren: () => import('../forms/form.routes').then((r) => r.routes),
  },

  // 4. loadChildren to a routes file that uses sub-routing → see SUB-ROUTING.md
  {
    path: 'sub-outlet',
    loadChildren: () => import('./sub-outlet.routes.example').then((r) => r.routes),
  },
];
```

| | Loads | When it's downloaded | Use it for |
|---|---|---|---|
| `component` | 1 component | When the app starts, in the main bundle | Small or always-needed pages: home, layout, 404 |
| `loadComponent` | 1 component | The first time someone visits that route | One standalone page |
| `loadChildren` | A `Routes` array (many pages) | The first time someone visits **any** route of the group | A feature area: forms, admin, shop… |

### `component`

```ts
import { IndexComponent } from '@pages/@index/index.component'; // static import at the top

{ path: '', component: IndexComponent }
```

### `loadComponent`

```ts
{
  path: 'signal-form',
  loadComponent: () =>
    import('./signal-form/signal-form.component').then((m) => m.SignalFormComponent),
}
```

- `import()` with brackets is a **dynamic import**: the build puts that file in its own chunk (a separate `.js` file).
- If the component is `export default class ...`, the `.then(...)` isn't needed:

```ts
loadComponent: () => import('./signal-form/signal-form.component'),
```

> ⚠️ **It's only lazy if nothing imports it statically.** In `app.routes.example.ts`, `IndexComponent` is imported at the top for route 1, so route 2 (`loaded`) can't be split into its own chunk. It works, but nothing is lazy-loaded. In a real app, the lazy file must not be imported anywhere else.

### `loadChildren`

```ts
// app.routes.ts
{
  path: 'form',
  loadChildren: () => import('./pages/forms/form.routes').then((r) => r.routes),
}

// pages/forms/form.routes.ts
export const routes: Routes = [
  { path: 'reactive-form', loadComponent: () => import('./reactive-form/reactive-form.component').then((m) => m.ReactiveFormComponent) },
  { path: 'signal-form',   loadComponent: () => import('./signal-form/signal-form.component').then((m) => m.SignalFormComponent) },
  { path: 'template-form', loadComponent: () => import('./template-form/template-form.component').then((m) => m.TemplateFormComponent) },
];
```

- The child paths are **added after** the parent path: `form` + `reactive-form` = `/form/reactive-form`.
- You can add `providers: [...]` (services only for that feature) and `canMatch: [...]` (don't even download it if not allowed) on the parent route.
- Old apps load an NgModule (`.then((m) => m.FormsModule)`). That still works, but a `Routes` file is the modern way.

## 4. Nesting `loadChildren`

A `loadChildren` file can itself use `loadChildren`. Each level adds its path to the URL:

```
app.routes.ts            'router'          → loadChildren(app.routes.example)
app.routes.example.ts      'sub-outlet'    → loadChildren(sub-outlet.routes.example)
sub-outlet.routes.example    '' + '1'      → SubOutletComponent > ChildOneComponent

URL: /router/sub-outlet/1
```

## 5. Redirects and the 404 page

```ts
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  // ...
  { path: '**', loadComponent: () => import('./not-found/not-found.component') }, // ALWAYS LAST
];
```

- `pathMatch: 'full'` is required with `path: ''` + `redirectTo`. Without it, every URL starts with `''`, so everything would redirect.
- `'**'` matches anything. The router takes the **first** route that matches, so put it last.
- Without a `'**'` route, an unknown URL throws `NG04002: Cannot match any routes`.

## 6. Linking to a route

In the HTML, import `RouterLink` in the component, then:

```html
<a routerLink="/form/reactive-form">Reactive Forms</a>        <!-- absolute: starts with / -->
<a routerLink="reactive-form">Reactive Forms</a>              <!-- relative to the current route -->
<a [routerLink]="['/users', user.id]">Profile</a>             <!-- array: when part of it is a variable -->
```

> `routerLink="..."` (no brackets) is a **plain string URL**. `[routerLink]="..."` (brackets) is **TS code**: an array, a variable or an object. Writing an array without the brackets turns it into a broken URL.

Highlight the current page with `RouterLinkActive`:

```html
<a routerLink="/form/signal-form" routerLinkActive="active">Signal Forms</a>
```

In the TS:

```ts
private router = inject(Router);

goToForms() {
  this.router.navigate(['/form', 'signal-form']);   // array of segments
  // or
  this.router.navigateByUrl('/form/signal-form');   // one full URL string
}
```

## 7. Route params and query params

> 📖 [Read route state](https://angular.dev/guide/routing/read-route-state)

| | URL | Route | Read it as |
|---|---|---|---|
| **Route param** | `/user/42` | `{ path: 'user/:id' }` | `id = input<string>()` |
| **Query param** | `/user/42?tab=posts` | nothing to declare | `tab = input<string>()` |

### Step 1: turn on input binding (once)

```ts
// app.config.ts
provideRouter(routes, withComponentInputBinding()),
```

### Step 2: declare the param in the route

```ts
{ path: 'user/:id', loadComponent: () => import('./user/user.component').then((m) => m.UserComponent) }
```

### Step 3: an `input()` with the **same name**

```ts
export class UserComponent {
  id = input<string>();    // ':id'  → '42'
  tab = input<string>();   // '?tab' → 'posts' (undefined if not in the URL)
}
```

> The values are always **strings**. For a number: `id = input(0, { transform: numberAttribute })`.

### Link to it

```html
<a routerLink="/user/42">User 42</a>
<a [routerLink]="['/user', user.id]" [queryParams]="{ tab: 'posts' }">Posts</a>
```

```ts
this.router.navigate(['/user', 42], { queryParams: { tab: 'posts' } });
```

### Without `withComponentInputBinding()`: `ActivatedRoute`

The older way, still common in existing code:

```ts
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

export class UserComponent {
  private route = inject(ActivatedRoute);

  id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))));
  tab = toSignal(this.route.queryParamMap.pipe(map((q) => q.get('tab'))));

  // Or once, if the component is never reused for another id:
  // id = this.route.snapshot.paramMap.get('id');
}
```

## Common errors

| Error / symptom | Cause |
|---|---|
| `NG04002: Cannot match any routes. URL Segment: '...'` | No route has that path: a typo, a missing `'**'`, a `redirectTo` pointing to a path that doesn't exist, or a named-outlet path used as a normal path (see SUB-ROUTING.md) |
| The link does nothing / `Can't bind to 'routerLink'` | `RouterLink` is missing from the component's `imports` |
| Page is blank, no error | `<router-outlet />` is missing, or `RouterOutlet` is missing from `imports` |
| Every URL redirects to the same page | `redirectTo` on `path: ''` without `pathMatch: 'full'` |
| The `'**'` page shows instead of the right page | `'**'` isn't the last route |
| The param `input()` stays `undefined` | `withComponentInputBinding()` is missing in `app.config.ts`, or the input's name isn't the same as `:id` / `?tab` |
