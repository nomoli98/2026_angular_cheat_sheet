```ts theme.service.ts
import { DestroyRef, effect, inject, Service, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'theme'; // 'light' | 'dark' in localStorage, missing = follow the system

// Light / dark mode with Bootstrap 5.3: everything is driven by ONE attribute,
// <html data-bs-theme="dark">. Bootstrap's CSS variables (--bs-body-bg...) change with it.
// - nothing saved → follow the system (prefers-color-scheme), and keep following it
// - the user flips the switch → that choice is saved in localStorage and wins
@Service()
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _media = this._document.defaultView?.matchMedia?.(
    '(prefers-color-scheme: dark)',
  );

  private readonly _theme = signal<Theme>(this._read() ?? this._systemTheme());
  private readonly _followsSystem = signal(this._read() === null);

  readonly theme = this._theme.asReadonly(); // 'light' | 'dark'
  readonly followsSystem = this._followsSystem.asReadonly(); // true = nothing saved yet

  constructor() {
    // Every time theme() changes → write it on <html>
    effect(() => {
      this._document.documentElement.setAttribute('data-bs-theme', this._theme());
    });

    // The system setting changes (e.g. the OS goes dark at night) →
    // follow it, but only if the user never chose a theme himself
    const onSystemChange = () => {
      if (this._followsSystem()) this._theme.set(this._systemTheme());
    };
    this._media?.addEventListener('change', onSystemChange);
    inject(DestroyRef).onDestroy(() => this._media?.removeEventListener('change', onSystemChange));
  }

  set(theme: Theme): void {
    this._theme.set(theme);
    this._followsSystem.set(false);
    this._save(theme);
  }

  toggle(): void {
    this.set(this._theme() === 'dark' ? 'light' : 'dark');
  }

  // Forget the user's choice and follow the system again
  followSystem(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    this._followsSystem.set(true);
    this._theme.set(this._systemTheme());
  }

  private _systemTheme(): Theme {
    return this._media?.matches ? 'dark' : 'light';
  }

  // localStorage can be missing or blocked (private mode...): never crash for it
  private _read(): Theme | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  private _save(theme: Theme): void {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }
}
```
