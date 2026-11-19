# Bootstrap in Angular

> 📖 **Official docs:** [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/getting-started/introduction/)

How to add Bootstrap (CSS only) to an Angular project, and how this cheat sheet uses it.

---

## 1. Install

```bash
npm install bootstrap
```

That's it for the CSS. No `@popperjs/core`, no `@angular/localize`: those are only needed for Bootstrap's JavaScript (see [step 5](#5-optional-the-javascript-parts)).

---

## 2. Load the CSS in `angular.json`

In `projects > <your-project> > architect > build > options`, add Bootstrap **before** your own `styles.css`:

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.css"
]
```

Order matters: the last file wins, so your own styles can override Bootstrap.

> ⚠️ **Restart `ng serve`** after changing `angular.json`. It isn't hot-reloaded.

**Alternative:** instead of touching `angular.json`, import it at the top of `src/styles.css`:

```css
@import 'bootstrap/dist/css/bootstrap.min.css';
```

---

## 3. Use the classes in your templates

Nothing to import in the component: the CSS is global, so the classes work in every template.

```html
<button class="btn btn-primary">Save</button>
```

### Cheat sheet of the classes used most

| What | Classes |
|---|---|
| Page width | `container` (centred, max width), `container-fluid` (full width) |
| Spacing | `m-3`, `mb-3`, `mt-2`, `p-3`, `py-4`, `px-2`... (`m`/`p` + side `t b s e x y` + size `0`–`5`) |
| Grid | `row` > `col`, `col-md-6` (half width from medium screens), `g-3` (gap) |
| Buttons | `btn` + `btn-primary` / `btn-secondary` / `btn-danger` / `btn-outline-primary`, size `btn-sm` / `btn-lg` |
| Cards | `card` > `card-header` + `card-body`, or just `card card-body` for a simple box |
| Lists | `list-group` > `list-group-item`, `list-group-flush` (no outer border), `list-group-item-action` (hover effect on links) |
| Text | `text-muted`, `text-danger`, `text-primary`, `fw-bold`, `fw-semibold`, `small` |
| Display | `d-none`, `d-block`, `d-flex`, `gap-2`, `justify-content-between`, `align-items-center` |
| Borders | `border`, `border-bottom`, `rounded` |
| Navbar | `navbar` > `container` > `navbar-brand` |

### Forms

```html
<div class="mb-3">
  <label for="email" class="form-label">Email</label>
  <input id="email" class="form-control" />
</div>

<select class="form-select">...</select>

<div class="form-check">
  <input type="checkbox" id="terms" class="form-check-input" />
  <label for="terms" class="form-check-label">I agree</label>
</div>
```

| Element | Class |
|---|---|
| `<label>` | `form-label` |
| `<input>`, `<textarea>` | `form-control` |
| `<select>` | `form-select` |
| checkbox / radio | wrapper `form-check`, input `form-check-input`, label `form-check-label` |

### Form validation with Angular

Bootstrap shows an input in red with `is-invalid` and shows the message in `invalid-feedback`. Angular decides **when**, with a class binding:

```html
<input class="form-control" formControlName="email"
       [class.is-invalid]="form.get('email')?.invalid && form.get('email')?.touched" />

@if (form.get('email')?.invalid && form.get('email')?.touched) {
  <div class="invalid-feedback">Enter a valid email</div>
}
```

- `[class.is-invalid]="condition"` adds the class only while `condition` is true. No `NgClass` needed.
- `.invalid-feedback` is hidden by Bootstrap **unless the element right before it** is `.is-invalid`. For radios and checkboxes the message usually isn't right after the input, so force it: `class="invalid-feedback d-block"`.

The same idea works with all three kinds of form. See the form pages (`/form/...`) for the full examples.

---

## 4. Customise the look

Bootstrap 5.3 exposes its colours and sizes as CSS variables (`--bs-primary`, `--bs-border-radius`, `--bs-body-bg`...). Use them in your own CSS so everything stays consistent:

```css
.my-box {
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  color: var(--bs-primary);
}
```

You can also override them in `styles.css` (loaded after Bootstrap):

```css
:root {
  --bs-border-radius: 0.75rem;
}
```

**Dark mode:** add `data-bs-theme="dark"` on `<html>` in `src/index.html`.

> To change the brand colours everywhere (e.g. `$primary`), you need the Sass version of Bootstrap: rename `styles.css` to `styles.scss`, remove the `.min.css` from `angular.json` and write `$primary: #6f42c1; @import 'bootstrap/scss/bootstrap';`. More setup, so only if you really need it.

---

## 5. (Optional) The JavaScript parts

Dropdowns, modals, collapse, tooltips... need JavaScript. Two ways:

**a. Angular components (recommended in Angular): ng-bootstrap**

```bash
ng add @ng-bootstrap/ng-bootstrap
```

This installs ng-bootstrap **plus** `@popperjs/core` and `@angular/localize` (that's why those appear in `package.json`). Then import the component you need, e.g. `NgbDropdownModule`, in the component's `imports`. Docs: [ng-bootstrap.github.io](https://ng-bootstrap.github.io).

**b. Bootstrap's own JS bundle**

In `angular.json`, next to `styles`:

```json
"scripts": ["node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"]
```

Then the `data-bs-toggle="..."` attributes from the Bootstrap docs work. Simpler, but it touches the DOM behind Angular's back.

This cheat sheet uses **CSS only**: no JS needed.

---

## 6. How this cheat sheet uses Bootstrap

The pages are a cheat sheet first, so the HTML has to stay readable. The rule: **few classes in the templates, the rest in `src/styles.css`.**

- **`app.html`** has the navbar and the `<main class="container py-4">` once, so no page needs its own container or "back to index" link.
- **Each section of a page** is a `<section class="card card-body mb-3">`. One class attribute, nothing more.
- **Plain `<button>`, `<input>` and `<select>`** get a Bootstrap look from `styles.css`, using Bootstrap's CSS variables. So a demo page can write `<button (click)="...">` and it still looks good.
  - Buttons: only those with **no `class` at all** (`button:not([class])`). Add `class="btn btn-danger"` or your own class and Bootstrap / your CSS takes over.
  - Inputs: Angular adds its own classes to them (`ng-valid`, `ng-touched`... with `ngModel` or `formControlName`), so the rule skips inputs that already have a Bootstrap class instead (`input:not(.form-control)`, `select:not(.form-select)`).
- **`h2` / `h3` / `h4`** inside `<main>` are styled in `styles.css` (page title with a line under it, section titles in the primary colour).
- **Form pages** use the real Bootstrap form classes (`form-label`, `form-control`, `is-invalid`...) because that's worth having as an example.

---

## Gotchas

- **`input-group` is a Bootstrap class.** It puts its children on one row. Don't use it as your own class name for "label + input", use `mb-3` instead.
- Same for other generic names: `form`, `card`, `container`, `row`, `col`, `active`, `disabled`... Pick a different name for your own classes.
- Component styles (`styleUrl`) are scoped to the component, so they can't restyle Bootstrap in other components. Global overrides go in `src/styles.css`.
- Changed `angular.json` and nothing happened? Restart `ng serve`.
