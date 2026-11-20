import { Routes } from '@angular/router';

export const routes: Routes = [
    // /theme → the dark mode page (old links keep working)
    { path: '', redirectTo: 'dark-mode', pathMatch: 'full' },
    {
        path: 'dark-mode',
        loadComponent: () =>
            import('./dark-mode/dark-mode.component').then((m) => m.DarkModeComponent),
    },
    {
        path: 'bootstrap',
        loadComponent: () =>
            import('./bootstrap/bootstrap.component').then((m) => m.BootstrapComponent),
    },
];
