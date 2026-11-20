```html theme-toggle.component.html
<div class="form-check form-switch mb-0">
  <input
    class="form-check-input"
    type="checkbox"
    role="switch"
    id="theme-toggle"
    [checked]="theme.theme() === 'dark'"
    (change)="theme.set($any($event.target).checked ? 'dark' : 'light')"
  />
  <label class="form-check-label small" for="theme-toggle">Dark mode</label>
</div>
```

```ts theme-toggle.component.ts
import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

// logic in ThemeService
@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
}
```

```html app.html
<nav class="navbar bg-body-tertiary border-bottom">
  <div class="container">
    <a class="navbar-brand fw-semibold" routerLink="/">Angular 22 cheat sheet</a>
    <div class="d-flex align-items-center gap-4">
      <app-theme-toggle />
      <app-auth-toggle />
    </div>
  </div>
</nav>
```
