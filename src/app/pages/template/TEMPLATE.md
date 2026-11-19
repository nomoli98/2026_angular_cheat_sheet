# Templates in Angular 22

> 📖 **Official docs:** [Templates overview](https://angular.dev/guide/templates)

Everything you write in a component's `.html`: **binding** (getting data in and out of the HTML) and **syntax** (`@if`, `@for`, `@switch`, `@let`, `@defer`).

| Folder | What's in it | Doc |
|---|---|---|
| `binding/` | `{{ }}`, `[prop]`, `[attr.x]`, `[class.x]`, `(event)`, `[(two-way)]`, `input()`, `output()`, `model()` | [binding/BINDING.md](./binding/BINDING.md) |
| `syntax/` | `@if`, `@switch`, `@for`, `@let`, `@defer` | [syntax/SYNTAX.md](./syntax/SYNTAX.md) |

## The demo pages

All lazy-loaded from `template.routes.ts` under `/template/...`:

| URL | Component | Shows |
|---|---|---|
| `/template/static-binding` | `binding/static-binding/` | Interpolation, property, attribute and class binding with plain fields |
| `/template/responsive-binding` | `binding/responsive-binding/` | The same bindings with signals, so they update |
| `/template/event-binding` | `binding/event-binding/` | `(click)`, `(keyup)`, `$event` |
| `/template/two-way-binding` | `binding/two-way-binding/` | `[(ngModel)]`, and `model()` vs `signal()` |
| `/template/condition` | `syntax/condition/` | `@if` / `@else if` / `@else`, `@switch` |
| `/template/loop` | `syntax/loops/` | `@for` with `track` |

## The whole thing on one screen

```html
<!-- BINDING -->
{{ title() }}                              <!-- show a value -->
<img [src]="url()" alt="Photo of {{ name() }}" />   <!-- set a DOM property -->
<td [attr.colspan]="span()"></td>          <!-- set an HTML attribute -->
<p [class.active]="isActive()"></p>        <!-- toggle one class -->
<p [style.width.px]="width()"></p>         <!-- set one style -->
<button (click)="save()">Save</button>     <!-- listen to an event -->
<input [(ngModel)]="name" />               <!-- two-way (needs FormsModule) -->
<app-child [value]="x()" (changed)="onChanged($event)" [(count)]="count" />

<!-- SYNTAX -->
@if (user(); as u) { Hi {{ u.name }} } @else { Please log in }

@switch (status()) {
  @case ('ok') { ✔ }
  @default { ? }
}

@for (item of items(); track item.id; let i = $index) {
  <li>{{ i }} - {{ item.name }}</li>
} @empty {
  <li>Nothing here</li>
}

@let total = price() * quantity();

@defer (on viewport) { <app-heavy-chart /> } @placeholder { <p>Chart</p> }
```

## Things to know about Angular 22

- **Components are `OnPush` by default.** If you don't set `changeDetection`, Angular only re-renders the component when a signal it reads changes, an input changes, or an event fires inside it. In short: **use signals for anything that changes** and it just works. A plain field changed from a `setTimeout` or a `subscribe` will NOT show up. `ChangeDetectionStrategy.Eager` is the new name for the old always-check behaviour.
- **Comments are allowed between attributes** in an opening tag. This is handy to switch one binding off for a while:
  ```html
  <input
    [value]="value()"
    <!-- (blur)="onBlur()" -->
    type="search"
  />
  ```
- **`@for` loops are type-checked** at build time, so a wrong `track` expression or a typo in the item breaks the build instead of failing silently.
- **From 22.3:** `count++` / `count--` work in event handlers (`(click)="count++"`), and the compiler warns about `[style.height]="200"` (no unit, so it does nothing).

## Template file tips

- `@` and `{ }` are special in templates. To print them as text, write `&#64;`, `&#123;` and `&#125;` (that's why `condition.component.html` has `&#64;if`).
- Members used in the template should be `protected` (or public). Keep `private` for things only the class uses.
- Each standalone component must list what its template uses in `imports: [...]` (other components, `FormsModule`, `RouterLink`...). The built-in blocks (`@if`, `@for`...) need **no** import.
