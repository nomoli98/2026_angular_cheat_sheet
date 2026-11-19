```ts app.routes.example.ts
import { Routes } from '@angular/router';
import { IndexComponent } from '@pages/@index/index.component';

// Loaded under 'router' in app.routes.ts, so every path here starts with /router
export const routes: Routes = [
  {
    // 1. component: downloaded when the app starts, even if the user never visits that route
    path: '',
    component: IndexComponent,
  },
  {
    // 2. loadComponent: ONE component, downloaded the first time you visit it → /router/loaded
    path: 'loaded',
    loadComponent: () => import('../@index/index.component').then((m) => m.IndexComponent),
  },
  {
    // 3. loadChildren: a whole routes FILE, downloaded the first time you visit one of its pages
    //    → /router/routes/reactive-form
    path: 'routes',
    loadChildren: () => import('../forms/form.routes').then((r) => r.routes),
  },
];
```

```ts form.routes.ts
import { Routes } from '@angular/router';

// The paths are added after the parent: 'routes' + 'reactive-form' = /router/routes/reactive-form
export const routes: Routes = [
  {
    path: 'reactive-form',
    loadComponent: () =>
      import('./reactive-form/reactive-form.component').then((m) => m.ReactiveFormComponent),
  },
];
```

```ts app.routes.ts
// How the example file above is plugged into the real app
{
  path: 'router',
  loadChildren: () => import('./pages/routers/app.routes.example').then((r) => r.routes),
},
```

```ts app.config.ts
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
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

```html app.html
<!-- The page of the current URL is displayed here -->
<router-outlet />
```
