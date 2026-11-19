import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    // NOT protected: the page the guard sends you to
    path: 'auth-service',
    loadComponent: () =>
      import('./auth-service/auth-service.component').then((m) => m.AuthServiceComponent),
  },
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
    ],
  },
];
