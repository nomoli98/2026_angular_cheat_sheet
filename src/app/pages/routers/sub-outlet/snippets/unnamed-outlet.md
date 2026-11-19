```html sub-outlet.component.html
<!-- The child route is displayed here -->
<router-outlet />

<button routerLink="/router/sub-outlet/1">show child one</button>
<button routerLink="/router/sub-outlet/2">show child two</button>
```

```ts sub-outlet.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sub-outlet',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './sub-outlet.component.html',
})
export class SubOutletComponent {}
```

```ts sub-outlet.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sub-outlet/sub-outlet.component').then((m) => m.SubOutletComponent),
    children: [
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
    ],
  },
];
```
