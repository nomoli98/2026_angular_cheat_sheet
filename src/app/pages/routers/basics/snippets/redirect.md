```ts app.routes.ts
export const routes: Routes = [
  // '' + redirectTo needs pathMatch: 'full', or EVERY URL is redirected
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },

  // An old URL that now points to a new one
  { path: 'old-basics', redirectTo: 'basics' },

  // 404: matches everything. The router takes the FIRST match, so ALWAYS LAST
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
```

```html not-found.component.html
<h2>404: page not found</h2>

<a routerLink="/">Back to the home page</a>
```
