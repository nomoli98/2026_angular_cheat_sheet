import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';

// NOT protected: you log in here (else infinite loop)
export const routes: Routes = [
  {
    // where the guard sends you
    path: 'auth-service',
    loadComponent: () =>
      import('./auth-service/auth-service.component').then((m) => m.AuthServiceComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },
  // roles (AUTHORIZATION.md)
  {
    // not protected: adminGuard redirects here
    path: 'authorization',
    loadComponent: () =>
      import('./authorization/authorization.component').then((m) => m.AuthorizationComponent),
  },
  {
    path: 'authorization/admin-area',
    canActivate: [adminGuard], // admins only
    runGuardsAndResolvers: 'always', // re-run on the Admin toggle
    loadComponent: () =>
      import('./authorization/admin-area/admin-area.component').then((m) => m.AdminAreaComponent),
  },
  // bcrypt version (BCRYPT.md)
  {
    path: 'bcrypt/explain',
    loadComponent: () =>
      import('./bcrypt/explain/explain.component').then((m) => m.BcryptExplainComponent),
  },
  {
    path: 'bcrypt/register',
    loadComponent: () =>
      import('./bcrypt/register/register.component').then((m) => m.BcryptRegisterComponent),
  },
  {
    path: 'bcrypt/login',
    loadComponent: () =>
      import('./bcrypt/login/login.component').then((m) => m.BcryptLoginComponent),
  },
  // token version (TOKEN.md)
  {
    path: 'token/explain',
    loadComponent: () =>
      import('./token/explain/explain.component').then((m) => m.TokenExplainComponent),
  },
  {
    path: 'token/register',
    loadComponent: () =>
      import('./token/register/register.component').then((m) => m.TokenRegisterComponent),
  },
  {
    path: 'token/login',
    loadComponent: () => import('./token/login/login.component').then((m) => m.TokenLoginComponent),
  },
];
