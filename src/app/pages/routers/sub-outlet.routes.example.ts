import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sub-outlet/sub-outlet.component').then((m) => m.SubOutletComponent),
    children: [
      //A. to an unnamed router-outlet
      { path: '', redirectTo: '1', pathMatch: 'full' },
      {
        path: '1',
        loadComponent: () =>
          import('./children/child-one/child-one.component').then((m) => m.ChildOneComponent),
      },
      {
        path: '2',
        loadComponent: () =>
          import('./children/child-two/child-two.component').then((m) => m.ChildTwoComponent),
      },
      //B. to a named router-outlet
      {
        path: '3',
        outlet: 'panel',
        loadComponent: () =>
          import('./children/child-three/child-three.component').then((m) => m.ChildThreeComponent),
      },
    ],
  },
];
