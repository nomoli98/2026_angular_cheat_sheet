import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'input',
        loadComponent: () => import('./input/input.component').then((m) => m.InputComponent),
    },
    {
        path: 'output',
        loadComponent: () => import('./output/output.component').then((m) => m.OutputComponent),
    },
];
