```html sub-outlet.component.html
<!-- named: outlet 'panel' only -->
<router-outlet name="panel" />

<button (click)="openPanel()">Open child 3 (TS)</button>
<button (click)="closePanel()">Close panel (TS)</button>
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
      // B. to a named router-outlet
      {
        path: '3',
        outlet: 'panel',
        loadComponent: () =>
          import('./children/child-three/child-three.component').then((m) => m.ChildThreeComponent),
      },
    ],
  },
];
```
