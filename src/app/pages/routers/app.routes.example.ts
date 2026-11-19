import { Routes } from '@angular/router';
import { IndexComponent } from '../@index/index.component';

export const routes: Routes = [
  {
  //1. Component: the component is downloaded when the app starts, even if the user never visits that route.
    path: '',
    component: IndexComponent,
  },
  {
  //2. LoadComponent: the component is only downloaded when the user navigated to that route.
    path: 'loaded',
    loadComponent: () => import('../@index/index.component').then(m => m.IndexComponent)
  },
  {
  //3. loadChildren: Loads another routes file
    path: 'routes',
    loadChildren: () => import('../forms/form.routes').then((r) => r.routes),
  },
  {
    //4. Nested router-outlet
    // First go to a child router
    path: 'sub-outlet',
    loadChildren: () => import('./sub-outlet.routes.example').then(r=>r.routes)
  },
  {
    //5. Route params: ':id' is a variable part of the URL → /router/basics/user/42
    path: 'basics',
    loadComponent: () => import('./basics/basics.component').then((m) => m.BasicsComponent),
    children: [
      {
        path: 'user/:id',
        loadComponent: () => import('./basics/user/user.component').then((m) => m.UserComponent),
      },
    ],
  },
  {
    //6. Redirect: /router/old-basics → /router/basics
    path: 'old-basics',
    redirectTo: 'basics',
  },
];
