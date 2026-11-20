import { Routes } from '@angular/router';

// NOT protected: you need these pages to log in (protecting them would loop forever)
export const routes: Routes = [
  {
    // the page the guard sends you to
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
  // Same job, password stored as a bcrypt hash (see bcrypt/BCRYPT.md)
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
  // Same job again, with a JWT made by the auth server (see token/TOKEN.md)
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
