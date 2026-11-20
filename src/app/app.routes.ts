import { Routes } from '@angular/router';
import { IndexComponent } from '@pages/@index/index.component';

export const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
  },
  {
    path: 'template',
    loadChildren: () => import('./pages/template/template.routes').then((r) => r.routes),
  },
  {
    path: 'form',
    loadChildren: () => import('./pages/forms/form.routes').then((r) => r.routes),
  },
  {
    path: 'router',
    loadChildren: () => import('./pages/routers/app.routes.example').then((r) => r.routes),
  },
  {
    path: 'input-output',
    loadChildren: () => import('./pages/input-output/input-output.routes').then((r) => r.routes),
  },
  {
    path: 'tests',
    loadChildren: () => import('./pages/tests/tests.routes').then((r) => r.routes),
  },
  {
    path: 'theme',
    loadComponent: () => import('./pages/theme/theme.component').then((m) => m.ThemeComponent),
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then((r) => r.routes),
  },
  {
    path: 'fake-api',
    loadComponent: () =>
      import('./pages/fake-api/fake-api.component').then((m) => m.FakeApiComponent),
  },
  {
    path: 'service',
    loadChildren: () => import('./pages/services/service.routes').then((r) => r.routes),
  },
  {
    // 404: matches every URL nobody else matched. ALWAYS LAST.
    path: '**',
    loadComponent: () =>
      import('./pages/routers/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
