```ts app.routes.example.ts
{
  // ':id' → /user/42
  path: 'basics',
  loadComponent: () => import('./basics/basics.component').then((m) => m.BasicsComponent),
  children: [
    {
      path: 'user/:id',
      loadComponent: () => import('./basics/user/user.component').then((m) => m.UserComponent),
    },
  ],
},
```

```ts app.config.ts
import { provideRouter, withComponentInputBinding } from '@angular/router';

export const appConfig: ApplicationConfig = {
    providers: [
        // 👇 params → input()
        provideRouter(routes, withComponentInputBinding()),
    ],
};
```

```ts user.component.ts
import { Component, input } from '@angular/core';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
})
export class UserComponent {
    // withComponentInputBinding()
    id = input<string>(); // /user/:id
    tab = input<string>(); // ?tab=posts
}
```

```html user.component.html
<p>User id: <strong>{{ id() }}</strong></p>
<p>Tab: <strong>{{ tab() ?? 'none' }}</strong></p>
```

```html basics.component.html
<!-- Path param -->
<a routerLink="user/1">user/1</a>

<!-- variable + query param -->
<a [routerLink]="['user', 2]" [queryParams]="{ tab: 'posts' }">user/2?tab=posts</a>

<!-- from the TS -->
<button (click)="goToUser42()">user/42?tab=settings (TS)</button>

<!-- child route here -->
<router-outlet />
```

```ts basics.component.ts
goToUser42() {
  this.router.navigate(['/router/basics/user', 42], { queryParams: { tab: 'settings' } });
}
```
