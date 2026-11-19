# Dark mode: a theme toggle with Bootstrap 5.3

> 📖 **Official docs:** [Bootstrap color modes](https://getbootstrap.com/docs/5.3/customize/color-modes/) · [MDN `prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) · [Angular `effect()`](https://angular.dev/guide/signals/effect)

Demo page: `/theme` (the switch is in the navbar, on every page)

Bootstrap 5.3 does almost everything: put **one attribute** on `<html>` and every Bootstrap color changes.

```html
<html data-bs-theme="dark">   <!-- or "light" -->
```

| Piece | File | Job |
| ----- | ---- | --- |
| **ThemeService** | `shared/theme-toggle/theme.service.ts` | the theme in a signal, writes `data-bs-theme`, saves the choice, follows the system |
| **The switch** | `shared/theme-toggle/theme-toggle.component.*` | "Dark mode" switch in the navbar |
| **No-flash script** | `src/index.html` | sets the theme **before** Angular starts |

### The rules

| Situation | Theme |
| --------- | ----- |
| Nothing saved (first visit) | the **system** setting (`prefers-color-scheme`), and it follows when the OS changes |
| The user flipped the switch | **their choice**, saved in `localStorage` (`theme` = `'light'` / `'dark'`), wins over the system |
| "Follow the system" (button on `/theme`) | forgets the choice, back to the system |

---

## 1. ThemeService, step by step

### 1.1 Read the system setting

```ts
private readonly _document = inject(DOCUMENT);
private readonly _media = this._document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');

private _systemTheme(): Theme {
  return this._media?.matches ? 'dark' : 'light';
}
```

> 💡 `?.` everywhere: some environments have no `window` or no `matchMedia` (unit tests in jsdom, server-side rendering). Without it, the service crashes there.

### 1.2 The theme in a signal: saved choice first, else the system

```ts
private readonly _theme = signal<Theme>(this._read() ?? this._systemTheme());
private readonly _followsSystem = signal(this._read() === null);

readonly theme = this._theme.asReadonly();
readonly followsSystem = this._followsSystem.asReadonly();
```

### 1.3 Write it on `<html>` with an `effect()`

```ts
constructor() {
  effect(() => {
    this._document.documentElement.setAttribute('data-bs-theme', this._theme());
  });
}
```

`effect()` runs once, then **again every time `_theme()` changes**. So `set()` only has to change the signal.

> 💡 Use `inject(DOCUMENT)` instead of the global `document`: it's easier to test and works in SSR.

### 1.4 Change it, and remember the choice

```ts
set(theme: Theme): void {
  this._theme.set(theme);
  this._followsSystem.set(false);
  this._save(theme); // localStorage.setItem('theme', theme), in a try/catch
}

followSystem(): void {
  localStorage.removeItem('theme');
  this._followsSystem.set(true);
  this._theme.set(this._systemTheme());
}
```

### 1.5 Follow the OS when it changes (e.g. dark at night)

```ts
const onSystemChange = () => {
  if (this._followsSystem()) this._theme.set(this._systemTheme()); // only if the user never chose
};
this._media?.addEventListener('change', onSystemChange);
inject(DestroyRef).onDestroy(() => this._media?.removeEventListener('change', onSystemChange));
```

> 💡 `DestroyRef.onDestroy`: always remove the listeners you add yourself. (For a root service it's when the app closes, but it's a good habit.)

---

## 2. The switch

```html
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

| Piece | Why |
| ----- | --- |
| `form-check form-switch` + `role="switch"` | Bootstrap's switch look, and screen readers announce "switch, on/off" |
| `[checked]="theme.theme() === 'dark'"` | the switch always shows the **real** theme (also when it follows the system) |
| `$any($event.target).checked` | `$event.target` is typed `EventTarget`, which has no `checked`: `$any` tells the template "trust me" |

It sits in the navbar (`app.html`), next to the auth toggle:

```html
<div class="d-flex align-items-center gap-4">
  <app-theme-toggle />
  <app-auth-toggle />
</div>
```

---

## 3. No white flash on load

Angular starts **after** the page is drawn. Without help, a dark-mode user sees a white page for a moment, then it turns dark. Fix: a tiny script in `index.html`, which runs before anything is drawn, with the **same rules** as the service:

```html
<!-- src/index.html, in <head> -->
<script>
  try {
    var saved = localStorage.getItem('theme');
    var dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
  } catch (e) {}
</script>
```

> ⚠️ It's plain JavaScript (not TypeScript, not Angular): keep it tiny, and keep the rules in sync with `ThemeService`.

---

## 4. Your own CSS in dark mode

Use **Bootstrap's CSS variables**: they change with the theme, so you have nothing to do.

```css
body {
  background-color: var(--bs-tertiary-bg);   /* ✅ follows the theme */
  color: #212529;                            /* ❌ stays dark-on-dark in dark mode */
}
```

| Instead of | Use |
| ---------- | --- |
| `#fff`, `white` (backgrounds) | `var(--bs-body-bg)` |
| `#212529`, `black` (text) | `var(--bs-body-color)` |
| a light grey background | `var(--bs-tertiary-bg)` / `var(--bs-secondary-bg)` |
| a grey border | `var(--bs-border-color)` |
| your blue | `var(--bs-primary)` |
| `bg-white` / `bg-light` / `text-dark` classes | `bg-body` / `bg-body-tertiary` / `text-body` |

A color Bootstrap doesn't have? Write one per theme:

```css
.my-box {
  background: #f8f9fa;
}
[data-bs-theme='dark'] .my-box {
  background: #212529;
}
```

> 💡 One part of a page always dark (or light)? Put the attribute on that element only: `<div data-bs-theme="dark">...</div>`.

---

## 5. Test it

`ThemeService` reads `matchMedia`, which jsdom doesn't have: fake it, so the test decides the system theme.

```ts
let systemDark = false;
let onSystemChange: (() => void) | undefined;

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = vi.fn(() => ({
    get matches() { return systemDark; },
    addEventListener: (_: string, fn: () => void) => (onSystemChange = fn),
    removeEventListener: vi.fn(),
  }) as unknown as MediaQueryList);
});

it('follows the system when nothing is saved', () => {
  systemDark = true;

  const theme = TestBed.inject(ThemeService);
  TestBed.tick(); // runs the effect → writes data-bs-theme

  expect(theme.theme()).toBe('dark');
  expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
});

it('ignores the OS change once the user chose a theme', () => {
  const theme = TestBed.inject(ThemeService);
  theme.set('light');

  systemDark = true;
  onSystemChange?.(); // the OS just went dark

  expect(theme.theme()).toBe('light');
});
```

> 💡 `TestBed.tick()` runs the pending `effect()`s. Without it, `data-bs-theme` isn't written yet when you check it.

Full example: `shared/theme-toggle/theme.service.spec.ts`. In Playwright, test both themes with `browser.newContext({ colorScheme: 'dark' })`.

---

## 🐛 Troubleshooting

### `TypeError: matchMedia is not a function` in unit tests

jsdom has no `matchMedia`. Use `?.` in the service (`defaultView?.matchMedia?.(...)`), and fake it in the test (section 5).

### A white flash when loading the page in dark mode

The script in `index.html` is missing, or it reads another `localStorage` key than the service (`'theme'` in both).

### Some text is invisible / a box stays white in dark mode

That CSS uses a fixed color (`#fff`, `color: black`, `bg-white`...). Replace it with a Bootstrap variable or class (section 4).

### The theme doesn't follow my OS anymore

You flipped the switch once: your choice is saved and wins. Click **Follow the system** on `/theme` (or run `localStorage.removeItem('theme')` in the console).

### The switch shows "off" but the page is dark

`[checked]` must read the real theme: `theme.theme() === 'dark'`, not a separate boolean that isn't updated when the system changes.
