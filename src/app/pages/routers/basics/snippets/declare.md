```ts app.routes.example.ts
import { Routes } from '@angular/router';
import { IndexComponent } from '@pages/@index/index.component';

// under /router
export const routes: Routes = [
    {
        // 1. component: eager
        path: '',
        component: IndexComponent,
    },
    {
        // 2. loadComponent: lazy
        path: 'loaded',
        loadComponent: () => import('../@index/index.component').then((m) => m.IndexComponent),
    },
    {
        // 3. loadChildren: lazy routes file
        path: 'routes',
        loadChildren: () => import('../forms/form.routes').then((r) => r.routes),
    },
];
```

```ts form.routes.ts
import { Routes } from '@angular/router';

// /router/routes/reactive-form
export const routes: Routes = [
    {
        path: 'reactive-form',
        loadComponent: () =>
            import('./reactive-form/reactive-form.component').then((m) => m.ReactiveFormComponent),
    },
];
```

```ts app.routes.ts
// plugged into the app
{
  path: 'router',
  loadChildren: () => import('./pages/routers/app.routes.example').then((r) => r.routes),
},
```

```ts app.config.ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        // params → input()
        provideRouter(routes, withComponentInputBinding()),
    ],
};
```

```html app.html
<!-- current page here -->
<router-outlet />
```
