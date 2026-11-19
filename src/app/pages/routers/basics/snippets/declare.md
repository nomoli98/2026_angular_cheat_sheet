```ts app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  // 1. component: downloaded when the app starts
  { path: '', component: HomeComponent },

  // 2. loadComponent: ONE component, downloaded the first time you visit it
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
  },

  // 3. loadChildren: a whole routes FILE, downloaded the first time you visit one of its pages
  {
    path: 'form',
    loadChildren: () => import('./forms/form.routes').then((r) => r.routes),
  },
];
```

```ts form.routes.ts
import { Routes } from '@angular/router';

// The paths are added after the parent: 'form' + 'reactive-form' = /form/reactive-form
export const routes: Routes = [
  {
    path: 'reactive-form',
    loadComponent: () =>
      import('./reactive-form/reactive-form.component').then((m) => m.ReactiveFormComponent),
  },
];
```

```ts app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
```

```html app.html
<!-- The page of the current URL is displayed here -->
<router-outlet />
```
