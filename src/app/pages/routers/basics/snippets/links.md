```html basics.component.html
<!-- Absolute link: starts with / -->
<a routerLink="/form/signal-form">Signal form</a>

<!-- Relative link: added to the current URL -->
<a routerLink="user/1">User 1</a>

<!-- Array with [ ]: when part of the URL is a variable -->
<a [routerLink]="['/users', userId]">Profile</a>

<!-- Adds the class "active" when this link is the current page -->
<a routerLink="/router/basics" routerLinkActive="active">This page</a>

<!-- exact: true → only active on exactly "/", not on every page -->
<a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>

<!-- Navigate from the TS -->
<button (click)="goToSignalForm()">Go to signal form</button>
```

```ts basics.component.ts
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-basics',
  imports: [RouterLink, RouterLinkActive], // 👈 without them, the links do nothing
  templateUrl: './basics.component.html',
})
export class BasicsComponent {
  private router = inject(Router);

  goToSignalForm() {
    this.router.navigate(['/form', 'signal-form']); // array of pieces
    // or: this.router.navigateByUrl('/form/signal-form'); // one full URL
  }
}
```
