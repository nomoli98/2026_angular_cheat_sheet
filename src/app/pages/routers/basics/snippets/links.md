```html basics.component.html
<!-- absolute: starts with / -->
<!-- routerLinkActive: class 'active' -->
<a routerLink="/router/basics" routerLinkActive="active">This page (active)</a>

<!-- exact: only on / -->
<a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>

<!-- relative → /router/basics/user/1 -->
<a routerLink="user/1">user/1</a>

<!-- array: variable parts -->
<a [routerLink]="['user', 2]">user/2</a>

<!-- from the TS -->
<button (click)="goToSignalForm()">Go to signal form (TS)</button>
```

```ts basics.component.ts
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-basics',
  imports: [RouterLink, RouterLinkActive, RouterOutlet], // 👈 required
  templateUrl: './basics.component.html',
})
export class BasicsComponent {
  private router = inject(Router);

  goToSignalForm() {
    this.router.navigate(['/form', 'signal-form']); // pieces
    // or: this.router.navigateByUrl('/form/signal-form'); // one full URL
  }

  goToUser42() {
    this.router.navigate(['/router/basics/user', 42], { queryParams: { tab: 'settings' } });
  }
}
```
