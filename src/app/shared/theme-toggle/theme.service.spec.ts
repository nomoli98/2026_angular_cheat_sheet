import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  // jsdom has no matchMedia: fake it
  let systemDark = false;
  let onSystemChange: (() => void) | undefined;

  const html = () => document.documentElement.getAttribute('data-bs-theme');

  function createService(): ThemeService {
    const service = TestBed.inject(ThemeService);
    TestBed.tick(); // runs the effect
    return service;
  }

  beforeEach(() => {
    localStorage.clear();
    systemDark = false;
    onSystemChange = undefined;
    window.matchMedia = vi.fn(
      () =>
        ({
          get matches() {
            return systemDark;
          },
          addEventListener: (_: string, fn: () => void) => (onSystemChange = fn),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
  });

  it('follows the system when nothing is saved', () => {
    systemDark = true;

    const theme = createService();

    expect(theme.theme()).toBe('dark');
    expect(theme.followsSystem()).toBe(true);
    expect(html()).toBe('dark');
  });

  it('uses the saved choice over the system', () => {
    systemDark = true;
    localStorage.setItem('theme', 'light');

    const theme = createService();

    expect(theme.theme()).toBe('light');
    expect(theme.followsSystem()).toBe(false);
  });

  it('set() changes <html> and saves the choice', () => {
    const theme = createService();

    theme.set('dark');
    TestBed.tick();

    expect(html()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('keeps following the system when the OS setting changes', () => {
    const theme = createService();

    systemDark = true;
    onSystemChange?.(); // the OS just went dark

    expect(theme.theme()).toBe('dark');
  });

  it('ignores the OS change once the user chose a theme', () => {
    const theme = createService();
    theme.set('light');

    systemDark = true;
    onSystemChange?.();

    expect(theme.theme()).toBe('light');
  });

  it('followSystem() forgets the choice', () => {
    systemDark = true;
    const theme = createService();
    theme.set('light');

    theme.followSystem();

    expect(theme.theme()).toBe('dark');
    expect(localStorage.getItem('theme')).toBeNull();
  });
});
