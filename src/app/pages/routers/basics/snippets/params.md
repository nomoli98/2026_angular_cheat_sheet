```ts app.routes.ts
{
  path: 'basics',
  loadComponent: () => import('./basics/basics.component').then((m) => m.BasicsComponent),
  children: [
    // ':id' = a variable part of the URL → /basics/user/42
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
    // 👇 the params go straight into the component's input()
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
  id = input<string>(); // from the path:  /user/:id  (same name as ':id')
  tab = input<string>(); // from the query: ?tab=posts (same name as 'tab')
}
```

```html user.component.html
<p>User id: {{ id() }}</p>
<p>Tab: {{ tab() ?? 'none' }}</p>
```

```html basics.component.html
<!-- Path param -->
<a routerLink="user/1">user/1</a>

<!-- Path param from a variable + a query param -->
<a [routerLink]="['user', 2]" [queryParams]="{ tab: 'posts' }">user/2?tab=posts</a>

<!-- The child route (UserComponent) is displayed here -->
<router-outlet />
```
