# Sub-routing in Angular 22: child routes and named outlets

> 📖 **Official docs:** [Show routes with outlets (child routes, named outlets)](https://angular.dev/guide/routing/show-routes-with-outlets) · [Define routes](https://angular.dev/guide/routing/define-routes)

A component that has **its own `<router-outlet>`**, so part of the page changes while the rest stays. A **named outlet** is a second outlet that changes on its own, like a side panel.

Files: `pages/routers/sub-outlet.routes.example.ts`, `pages/routers/sub-outlet/`, `pages/routers/children/`

Basics first: [ROUTING.md](./ROUTING.md).

---

## How it fits together

```
app.html
└── <router-outlet />                            ← root outlet
    └── SubOutletComponent                       ← /router/sub-outlet
        ├── <router-outlet />                    ← child 1 or child 2
        └── <router-outlet name="panel" />       ← child 3 (or empty)
```

| URL | Unnamed outlet | `panel` outlet |
|---|---|---|
| `/router/sub-outlet` | redirects to `/router/sub-outlet/1` | empty |
| `/router/sub-outlet/1` | ChildOneComponent | empty |
| `/router/sub-outlet/2` | ChildTwoComponent | empty |
| `/router/sub-outlet/(2//panel:3)` | ChildTwoComponent | ChildThreeComponent |
| `/router/sub-outlet/(panel:3)` | redirects to `/router/sub-outlet/(1//panel:3)` (the `redirectTo: '1'` still applies) | ChildThreeComponent |

---

## 1. Reach the routes file from the main router

```ts
// app.routes.ts
{
  path: 'router',
  loadChildren: () => import('./pages/routers/app.routes.example').then((r) => r.routes),
},

// pages/routers/app.routes.example.ts
{
  path: 'sub-outlet',
  loadChildren: () => import('./sub-outlet.routes.example').then((r) => r.routes),
},
```

## 2. Declare the parent component and its `children`

```ts
// pages/routers/sub-outlet.routes.example.ts
export const routes: Routes = [
  {
    path: '',                                  // = /router/sub-outlet
    loadComponent: () =>
      import('./sub-outlet/sub-outlet.component').then((m) => m.SubOutletComponent),
    children: [
      // A. into the unnamed <router-outlet />
      { path: '', redirectTo: '1', pathMatch: 'full' },
      {
        path: '1',
        loadComponent: () =>
          import('./children/child-one/child-one.component').then((m) => m.ChildOneComponent),
      },
      {
        path: '2',
        loadComponent: () =>
          import('./children/child-two/child-two.component').then((m) => m.ChildTwoComponent),
      },

      // B. into <router-outlet name="panel" />
      {
        path: '3',
        outlet: 'panel',
        loadComponent: () =>
          import('./children/child-three/child-three.component').then((m) => m.ChildThreeComponent),
      },
    ],
  },
];
```

- `children` = routes rendered **inside** the parent component's outlet, not in the root one.
- `outlet: 'panel'` = "render this in the outlet named `panel`". It must match `name="panel"` in the HTML exactly.
- The named-outlet routes go in the **same `children` array** as the other children of that parent.
- `redirectTo: '1'` must point to a child path that exists. Otherwise you get `NG04002`.

## 3. Put the outlets in the parent component

```ts
// sub-outlet/sub-outlet.component.ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sub-outlet',
  imports: [RouterOutlet, RouterLink],            // both are needed
  templateUrl: './sub-outlet.component.html',
})
export class SubOutletComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);        // = the /router/sub-outlet route

  openPanel() {
    this.router.navigate([{ outlets: { panel: ['3'] } }], { relativeTo: this.route });
  }

  closePanel() {
    this.router.navigate([{ outlets: { panel: null } }], { relativeTo: this.route });
  }
}
```

```html
<!-- sub-outlet/sub-outlet.component.html -->
<h2>SubOutlet</h2>

<h3>unnamed router-outlet:</h3>
<router-outlet />
<button routerLink="/router/sub-outlet/1">show child one</button>
<button routerLink="/router/sub-outlet/2">show child two</button>

<h3>named router-outlet</h3>
<router-outlet name="panel" />

<!-- with links -->
<a [routerLink]="[{ outlets: { panel: ['3'] } }]">Open child 3 in panel</a>
<a [routerLink]="[{ outlets: { panel: null } }]">Close panel</a>

<!-- with the TS methods -->
<button (click)="openPanel()">Open child 3 (TS)</button>
<button (click)="closePanel()">Close panel (TS)</button>
```

## 4. Link to the children

### Unnamed outlet: a normal link

```html
<button routerLink="/router/sub-outlet/2">show child two</button>   <!-- absolute -->
<button routerLink="2">show child two</button>                      <!-- relative to /router/sub-outlet -->
```

### Named outlet: the `outlets` object

```html
<a [routerLink]="[{ outlets: { panel: ['3'] } }]">Open</a>       <!-- put '3' in panel -->
<a [routerLink]="[{ outlets: { panel: null } }]">Close</a>       <!-- empty panel -->
```

- **Brackets are required** (`[routerLink]`), because it's an array with an object, not a string.
- The link is relative to the component it's in. Here that's `SubOutletComponent`, so it changes the `panel` of `/router/sub-outlet` and leaves the unnamed outlet as it is: `/router/sub-outlet/2` → `/router/sub-outlet/(2//panel:3)`.
- `null` clears the outlet: `/router/sub-outlet/(2//panel:3)` → `/router/sub-outlet/2`.

### From another component (absolute)

```html
<!-- e.g. in index.component.html -->
<a routerLink="/router/sub-outlet">subOutlet</a>

<!-- open the sub-outlet with child 2 AND the panel -->
<a [routerLink]="['/router/sub-outlet', { outlets: { primary: ['2'], panel: ['3'] } }]">
  child 2 + panel
</a>
```

`primary` is the name of the unnamed outlet.

### From the TS

```ts
// relative: from inside SubOutletComponent
this.router.navigate([{ outlets: { panel: ['3'] } }], { relativeTo: this.route });

// absolute: from anywhere
this.router.navigate(['/router/sub-outlet', { outlets: { panel: ['3'] } }]);

// with the URL string
this.router.navigateByUrl('/router/sub-outlet/(2//panel:3)');
```

Without `relativeTo`, `navigate` starts from the root `/`. From inside a child component, pass `{ relativeTo: this.route }` to change the outlets of the current route.

## 5. Reading the URL

```
/router/sub-outlet/(2//panel:3)
                   │ │  │     │
                   │ │  │     └ path in the panel outlet
                   │ │  └ outlet name
                   │ └ separator between outlets
                   └ path in the unnamed (primary) outlet
```

> A named-outlet path **can't** be written like a normal one. `/router/sub-outlet/3` looks for `3` in the **unnamed** outlet, finds nothing and throws `NG04002: Cannot match any routes. URL Segment: 'router/sub-outlet/3'`. Use `(panel:3)`.

## 6. Know when the panel is open (optional)

`<router-outlet>` emits events when a component is put in or removed:

```html
<router-outlet name="panel"
  (activate)="panelOpen.set(true)"
  (deactivate)="panelOpen.set(false)" />
```

```ts
panelOpen = signal(false);
```

Useful to show or hide the panel's container (`[class.open]="panelOpen()"`).

## Without lazy loading (same idea)

```ts
{
  path: 'sub-outlet',
  component: SubOutletComponent,
  children: [
    { path: '', redirectTo: '1', pathMatch: 'full' },
    { path: '1', component: ChildOneComponent },
    { path: '2', component: ChildTwoComponent },
    { path: '3', component: ChildThreeComponent, outlet: 'panel' },
  ],
}
```

## Checklist when it doesn't work

| Symptom | Check |
|---|---|
| `NG04002 ... 'router/sub-outlet/3'` | You used a named-outlet path as a normal path. Use `(panel:3)` / `{ outlets: { panel: ['3'] } }` |
| `NG04002` on `/router/sub-outlet` | `redirectTo` points to a child that doesn't exist |
| Children don't appear, no error | The parent has no `<router-outlet />`, or `RouterOutlet` isn't in its `imports` |
| Panel never fills | `outlet: '...'` and `name="..."` don't match, or the route isn't in the parent's `children` |
| The link goes to a weird URL like `/%5B%7B%20outlets...` | `routerLink` without brackets: the array was read as a string. Use `[routerLink]` |
| Panel opens at the wrong level | The link is relative to the component it's in. Use an absolute array (`['/router/sub-outlet', { outlets: ... }]`) or `relativeTo` |
