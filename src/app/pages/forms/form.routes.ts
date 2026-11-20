import { Routes } from '@angular/router';

export const routes: Routes = [
  //When you want your component to be loaded dynamically you can use LoadComponent. It is used like this:
  //FUN FACT: The "then(m => m.Component)" is a legacy from the module times, the m stands for module 😊☝️
  {
    path: 'reactive-form',
    loadComponent: () =>
      import('./reactive-form/reactive-form.component').then((m) => m.ReactiveFormComponent),
  },
  {
    path: 'signal-form',
    loadComponent: () =>
      import('./signal-form/signal-form.component').then((m) => m.SignalFormComponent),
  },
  {
    path: 'template-form',
    loadComponent: () =>
      import('./template-form/template-form.component').then((m) => m.TemplateFormComponent),
  },
  {
    path: 'reactive-validators',
    loadComponent: () =>
      import('./reactive-validators/reactive-validators.component').then(
        (m) => m.ReactiveValidatorsComponent,
      ),
  },
  {
    path: 'template-validators',
    loadComponent: () =>
      import('./template-validators/template-validators.component').then(
        (m) => m.TemplateValidatorsComponent,
      ),
  },
  {
    path: 'signal-validators',
    loadComponent: () =>
      import('./signal-validators/signal-validators.component').then(
        (m) => m.SignalValidatorsComponent,
      ),
  },
];
