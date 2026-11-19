import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'unit-test',
    loadComponent: () => import('./unit-test/unit-test.component').then((m) => m.UnitTestComponent),
  },
  {
    path: 'e2e-test',
    loadComponent: () => import('./e2e-test/e2e-test.component').then((m) => m.E2eTestComponent),
  },
];
