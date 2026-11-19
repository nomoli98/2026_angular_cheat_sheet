```html basics.component.html
<!-- Absolute link: starts with / -->
<!-- routerLinkActive adds the class "active" when this link is the current page -->
<a routerLink="/router/basics" routerLinkActive="active">This page (active)</a>

<!-- exact: true → only active on exactly "/", not on every page -->
<a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>

<!-- Relative link: added to the current URL → /router/basics/user/1 -->
<a routerLink="user/1">user/1</a>

<!-- Array with [ ]: when part of the URL is a variable -->
<a [routerLink]="['user', 2]">user/2</a>

<!-- Navigate from the TS -->
<button (click)="goToSignalForm()">Go to signal form (TS)</button>
```

```ts basics.component.ts
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-basics',
  imports: [RouterLink, RouterLinkActive, RouterOutlet], // 👈 without them, the links do nothing
  templateUrl: './basics.component.html',
})
export class BasicsComponent {
  private router = inject(Router);

  goToSignalForm() {
    this.router.navigate(['/form', 'signal-form']); // array of pieces
    // or: this.router.navigateByUrl('/form/signal-form'); // one full URL
  }

  goToUser42() {
    this.router.navigate(['/router/basics/user', 42], { queryParams: { tab: 'settings' } });
  }
}
```
