import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LoginFormComponent } from './login-form.component';
import { AuthService } from '../../../../core/services/auth.service';

// Small helper: type a value in an <input>, like a user would
function type(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input')); // tells the form "the value changed"
}

describe('LoginFormComponent', () => {
  let fixture: ComponentFixture<LoginFormComponent>;
  let html: HTMLElement;

  // Shortcuts to find the elements
  const email = () => html.querySelector('#email') as HTMLInputElement;
  const password = () => html.querySelector('#password') as HTMLInputElement;
  const button = () => html.querySelector('button') as HTMLButtonElement;

  // ── With the REAL AuthService ─────────────────────────────
  describe('with the real service', () => {
    beforeEach(async () => {
      fixture = TestBed.createComponent(LoginFormComponent);
      html = fixture.nativeElement;
      await fixture.whenStable();
    });

    it('disables the button when the form is empty', () => {
      expect(button().disabled).toBe(true);
    });

    it('marks a bad email as invalid', () => {
      type(email(), 'not-an-email');

      expect(fixture.componentInstance.loginForm.controls.email.invalid).toBe(true);
    });

    it('enables the button when both fields are valid', async () => {
      type(email(), 'bob@email.bob');
      type(password(), 'anything');
      await fixture.whenStable();

      expect(button().disabled).toBe(false);
    });

    it('shows the welcome message after a good login', async () => {
      type(email(), 'bob@email.bob');
      type(password(), 'BobIsTheBest99#');
      await fixture.whenStable();

      button().click();
      await fixture.whenStable();

      expect(html.textContent).toContain('Welcome, Bob!');
    });
  });

  // ── With a FAKE AuthService (a "mock") ─────────────────────
  // Use a fake when you only want to test the component, not the service
  // (e.g. a real service would call a server).
  describe('with a fake service', () => {
    const fakeAuth = {
      currentUser: signal(null),
      login: vi.fn().mockReturnValue(false), // always says "wrong password"
      logout: vi.fn(),
    };

    beforeEach(async () => {
      vi.clearAllMocks(); // the spies forget the calls from the previous test

      TestBed.configureTestingModule({
        // "When the component asks for AuthService, give it fakeAuth instead"
        providers: [{ provide: AuthService, useValue: fakeAuth }],
      });
      fixture = TestBed.createComponent(LoginFormComponent);
      html = fixture.nativeElement;
      await fixture.whenStable();
    });

    it('sends the typed email and password to the service', async () => {
      type(email(), 'bob@email.bob');
      type(password(), '1234');
      await fixture.whenStable();

      button().click();

      expect(fakeAuth.login).toHaveBeenCalledWith('bob@email.bob', '1234');
    });

    it('shows an error when the service says no', async () => {
      type(email(), 'bob@email.bob');
      type(password(), '1234');
      await fixture.whenStable();

      button().click();
      await fixture.whenStable();

      expect(html.textContent).toContain('Wrong email or password');
    });
  });
});
