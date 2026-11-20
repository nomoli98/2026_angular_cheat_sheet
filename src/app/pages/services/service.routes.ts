import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    // Every page in `children` is protected: the guard runs before any of them opens
    path: '',
    canActivate: [authGuard],
    // re-run the guard on EVERY navigation, even to the same URL (when the toggle turns off)
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: 'get-all',
        loadComponent: () => import('./get-all/get-all.component').then((m) => m.GetAllComponent),
      },
      {
        path: 'get-one',
        loadComponent: () => import('./get-one/get-one.component').then((m) => m.GetOneComponent),
      },
      {
        path: 'get-me',
        loadComponent: () => import('./get-me/get-me.component').then((m) => m.GetMeComponent),
      },
      {
        path: 'update-fully',
        loadComponent: () =>
          import('./update-fully/update-fully.component').then((m) => m.UpdateFullyComponent),
      },
      {
        path: 'update',
        loadComponent: () => import('./update/update.component').then((m) => m.UpdateComponent),
      },
      {
        path: 'delete',
        loadComponent: () => import('./delete/delete.component').then((m) => m.DeleteComponent),
      },
    ],
  },
];
