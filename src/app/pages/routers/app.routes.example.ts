import { Routes } from '@angular/router';
import { IndexComponent } from '../@index/index.component';

export const routes: Routes = [
    {
        // 1. component: downloaded at start
        path: '',
        component: IndexComponent,
    },
    {
        // 2. loadComponent: downloaded on first visit
        path: 'loaded',
        loadComponent: () => import('../@index/index.component').then((m) => m.IndexComponent),
    },
    {
        // 3. loadChildren: another routes file
        path: 'routes',
        loadChildren: () => import('../forms/form.routes').then((r) => r.routes),
    },
    {
        // 4. nested router-outlet
        path: 'sub-outlet',
        loadChildren: () => import('./sub-outlet.routes.example').then((r) => r.routes),
    },
    {
        // 5. route params: /router/basics/user/42
        path: 'basics',
        loadComponent: () => import('./basics/basics.component').then((m) => m.BasicsComponent),
        children: [
            {
                path: 'user/:id',
                loadComponent: () =>
                    import('./basics/user/user.component').then((m) => m.UserComponent),
            },
        ],
    },
    {
        // 6. redirect
        path: 'old-basics',
        redirectTo: 'basics',
    },
];
