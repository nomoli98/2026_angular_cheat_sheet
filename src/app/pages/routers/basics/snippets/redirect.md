```ts app.routes.example.ts
{
  // An old URL that now points to a new one: /router/old-basics → /router/basics
  path: 'old-basics',
  redirectTo: 'basics',
},
```

```ts sub-outlet.routes.example.ts
// '' + redirectTo needs pathMatch: 'full', or EVERY URL is redirected
{ path: '', redirectTo: '1', pathMatch: 'full' },
```

```ts app.routes.ts
{
  // 404: matches every URL nobody else matched.
  // The router takes the FIRST match, so ALWAYS LAST
  path: '**',
  loadComponent: () =>
    import('./pages/routers/not-found/not-found.component').then((m) => m.NotFoundComponent),
},
```

```html not-found.component.html
<h2>404: page not found</h2>

<p>This URL doesn't match any route, so the router showed the <code>'**'</code> route.</p>

<a routerLink="/">Back to the home page</a>
```
