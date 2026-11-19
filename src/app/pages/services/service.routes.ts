import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'all-users',
    loadComponent: () => import('./get-all/get-all.component').then((m) => m.GetAllComponent),
  },
];
