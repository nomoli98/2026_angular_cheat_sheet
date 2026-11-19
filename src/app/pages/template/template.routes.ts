import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'static-binding',
    loadComponent: () =>
      import('./binding/static-binding/static-binding.component').then(
        (m) => m.StaticBindingComponent,
      ),
  },
  {
    path: 'responsive-binding',
    loadComponent: () =>
      import('./binding/responsive-binding/responsive-binding.component').then(
        (m) => m.ResponsiveBindingComponent,
      ),
  },
  {
    path: 'event-binding',
    loadComponent: () =>
      import('./binding/event-binding/event-binding.component').then(
        (m) => m.EventBindingComponent,
      ),
  },
  {
    path: 'two-way-binding',
    loadComponent: () =>
      import('./binding/two-way-binding/two-way-binding.component').then(
        (m) => m.TwoWayBindingComponent,
      ),
  },
  {
    path: 'condition',
    loadComponent: () =>
      import('./syntax/condition/condition.component').then((m) => m.ConditionComponent),
  },
  {
    path: 'loop',
    loadComponent: () =>
      import('./syntax/loops/loops.component').then((m) => m.LoopsComponent),
  },
];
