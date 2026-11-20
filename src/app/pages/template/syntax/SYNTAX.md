# Template syntax in Angular 22

> 📖 **Official docs:** [Control flow (@if, @for, @switch)](https://angular.dev/guide/templates/control-flow) · [Local template variables (@let)](https://angular.dev/guide/templates/variables) · [Deferred loading (@defer)](https://angular.dev/guide/templates/defer)

The built-in blocks for **conditions**, **loops**, **local variables** and **lazy loading** inside a template.

Files: `condition/`, `loops/`

They are part of the template language: **no import needed** (no `CommonModule`, no `NgIf`).

---

## 1. `@if` / `@else if` / `@else`

```html
@if (firstOption()) {
<p>This is the first option</p>
} @else if (secondOption()) {
<p>This is the second option</p>
} @else {
<p>This is none</p>
}
```

Only **one** branch is shown: the first one that's true wins.

### Save the value with `as`

Handy when the condition is something you then want to use (and to avoid calling it again):

```html
@if (user(); as u) {
<p>Hello {{ u.name }}</p>
} @else {
<p>Please log in</p>
}
```

## 2. `@switch` / `@case` / `@default`

```html
@switch (switchOptions) { @case ('A') {
<p>Show A</p>
} @case ('B') {
<p>Show B</p>
} @default {
<p>Show default</p>
} }
```

- The comparison is strict: `===`.
- **No fall-through** and no `break` (unlike JS): only the matching `@case` is shown.
- `@default` is optional.
- Use `@switch` for one value with many possible results, and `@if` for different conditions.

## 3. `@for`, `track` and `@empty`

```html
<ul>
    @for (item of items; track item.id) {
    <li>{{ item.name }}</li>
    } @empty {
    <li>No items</li>
    }
</ul>
```

- `track` is **required**. It tells Angular which DOM element belongs to which item, so it only redraws what changed.
- `@empty` (optional) is shown when the list is empty.

### What to track

| `track ...` | When                                                               |
| ----------- | ------------------------------------------------------------------ |
| `item.id`   | The default. Use it whenever the items have a unique id            |
| `item`      | A list of strings or numbers with no duplicates                    |
| `$index`    | Only for a list that never gets items added, removed or re-ordered |

With `track $index` on a list that changes, Angular re-uses the wrong elements: an `<input>` keeps the text of the old item, animations play on the wrong row...

### Contextual variables

| Variable           | Value                            |
| ------------------ | -------------------------------- |
| `$index`           | position, from 0                 |
| `$count`           | length of the list               |
| `$first` / `$last` | `true` for the first / last item |
| `$even` / `$odd`   | `true` for even / odd positions  |

```html
@for (item of items; track item.id; let i = $index, last = $last) {
<li [class.striped]="$even">{{ i + 1 }}/{{ $count }} - {{ item.name }}@if (!last) {,}</li>
}
```

Use `let x = $index` to rename them. It's required in **nested** loops to reach the outer index:

```html
@for (row of rows; track row.id; let rowIndex = $index) { @for (cell of row.cells; track cell.id) {
<span>{{ rowIndex }}-{{ $index }}</span>
} }
```

## 4. `@let`: a local variable in the template

```html
@let user = currentUser(); @let total = price() * quantity(); @let fullName = user.firstName + ' ' +
user.lastName;

<h1>{{ fullName }}</h1>
<p>Total: {{ total }}</p>
```

- Read-only: you can't assign it again from the template.
- Only visible **after** the line it's declared on, and inside the same block (and its children).
- Good to avoid calling the same signal or long expression many times. For real logic, prefer a `computed()` in the TS.

## 5. `@defer`: lazy-load part of a page

The components inside a `@defer` are put in a **separate JS file**, downloaded only when the trigger happens.

```html
@defer (on viewport) {
<app-heavy-chart />
} @placeholder (minimum 500ms) {
<p>The chart will load here</p>
} @loading (after 100ms; minimum 1s) {
<p>Loading...</p>
} @error {
<p>Could not load the chart</p>
}
```

| Block          | Shown                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| `@placeholder` | before the trigger. Required for `on viewport` (it needs an element to watch)       |
| `@loading`     | while the JS downloads. `after` = wait before showing it, `minimum` = avoid flicker |
| `@error`       | if the download fails                                                               |

### Triggers

| Trigger          | Loads when                                              |
| ---------------- | ------------------------------------------------------- |
| `on idle`        | the browser has nothing to do (the **default**)         |
| `on viewport`    | the placeholder scrolls into view                       |
| `on interaction` | the user clicks or types in the placeholder             |
| `on hover`       | the mouse is over the placeholder                       |
| `on immediate`   | right after the rest of the page is rendered            |
| `on timer(2s)`   | after a delay                                           |
| `when isOpen()`  | a condition becomes true (only once, it doesn't unload) |

```html
<!-- several triggers = whichever comes first; prefetch = download early, show later -->
@defer (on interaction; on timer(5s); prefetch on idle) {
<app-comments />
} @placeholder {
<button>Show comments</button>
}
```

Only **standalone** components that are **not used anywhere else eagerly** in the same file get really split out.

## 6. Old syntax → new syntax

You will still see the old structural directives in older code:

| Old (needs `CommonModule`)                                    | New                                                       |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| `<p *ngIf="ok; else other">` + `<ng-template #other>`         | `@if (ok) { } @else { }`                                  |
| `<li *ngFor="let item of items; trackBy: fn; let i = index">` | `@for (item of items; track item.id; let i = $index) { }` |
| `[ngSwitch]` / `*ngSwitchCase` / `*ngSwitchDefault`           | `@switch` / `@case` / `@default`                          |
| `*ngIf="user$ \| async as user"`                              | `@if (user$ \| async; as user) { }`                       |

Migrate a project automatically:

```bash
ng generate @angular/core:control-flow
```

## Common mistakes

| Problem                                       | Fix                                                       |
| --------------------------------------------- | --------------------------------------------------------- |
| `@for` error: missing `track`                 | Add `track item.id` (or `track $index` for a static list) |
| You want to show `@if` as text                | Write `&#64;if` (and `&#123;` / `&#125;` for `{` `}`)     |
| `@else if` with no space (`@elseif`)          | It's `@else if`                                           |
| `@switch` never matches                       | It uses `===`: `'1'` is not `1`                           |
| `@let` "can't be used before it's declared"   | Move the `@let` above the line that uses it               |
| `@defer (on viewport)` with no `@placeholder` | Add a `@placeholder`: it's the element being watched      |
