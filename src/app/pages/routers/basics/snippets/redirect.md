```ts app.routes.example.ts
{
  // old URL → new one
  path: 'old-basics',
  redirectTo: 'basics',
},
```

```ts sub-outlet.routes.example.ts
// '' needs pathMatch: 'full'
{ path: '', redirectTo: '1', pathMatch: 'full' },
```

```ts app.routes.ts
{
  // 404: ALWAYS LAST
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
