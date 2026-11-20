```html sub-outlet.component.html
<!-- child route here -->
<router-outlet />

<button routerLink="/router/sub-outlet/1">show child one</button>
<button routerLink="/router/sub-outlet/2">show child two</button>
```

```ts sub-outlet.component.ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sub-outlet',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './sub-outlet.component.html',
})
export class SubOutletComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute); // /router/sub-outlet

  openPanel() {
    this.router.navigate([{ outlets: { panel: ['3'] } }], { relativeTo: this.route });
  }

  closePanel() {
    this.router.navigate([{ outlets: { panel: null } }], { relativeTo: this.route });
  }
}
```

```ts sub-outlet.routes.example.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sub-outlet/sub-outlet.component').then((m) => m.SubOutletComponent),
    children: [
      // A. to an unnamed router-outlet
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

```ts app.routes.example.ts
{
  // nested routes file
  path: 'sub-outlet',
  loadChildren: () => import('./sub-outlet.routes.example').then((r) => r.routes),
},
```
