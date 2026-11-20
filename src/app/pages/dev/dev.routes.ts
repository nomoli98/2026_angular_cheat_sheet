import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'prettier',
        loadComponent: () =>
            import('./prettier/prettier.component').then((m) => m.PrettierComponent),
    },
];
