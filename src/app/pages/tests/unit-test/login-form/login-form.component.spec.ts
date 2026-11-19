import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { throwError } from 'rxjs';
import { LoginFormComponent } from './login-form.component';
import { AuthService } from '@core/services/auth.service';
import { UserEntity } from '@core/entities/user.entity';
import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';
import { RoleEnum } from '@core/enums/role.enum';
import { environment } from '@env/environment';

// Small helper: type a value in an <input>, like a user would
function type(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input')); // tells the form "the value changed"
}

// What the fake API would send back for Bob
const bob: UserEntity = {
  id: 1,
  name: 'Bob Martin',
  email: 'bob@email.bob',
  password: 'BobIsTheBest99#',
  birthdate: '2000-09-22',
  height: 195,
  gender: GenderEnum.MALE,
  subscription: SubscriptionEnum.PREMIUM,
  agreeToTerms: true,
  role: RoleEnum.ADMIN,
};

describe('LoginFormComponent', () => {
  let fixture: ComponentFixture<LoginFormComponent>;
  let html: HTMLElement;

  // Shortcuts to find the elements
  const email = () => html.querySelector('#email') as HTMLInputElement;
  const password = () => html.querySelector('#password') as HTMLInputElement;
  const button = () => html.querySelector('button') as HTMLButtonElement;

  // ── With the REAL AuthService, but a FAKE backend ──────────
  // provideHttpClientTesting(): no request leaves the test.
  // HttpTestingController catches them and the TEST decides the answer.
  describe('with the real service', () => {
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });
      httpTesting = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(LoginFormComponent);
      html = fixture.nativeElement;
      await fixture.whenStable();
    });

    afterEach(() => {
      httpTesting.verify(); // fails if a request was sent but never answered
    });

    // Fill the form, click, and answer the GET /people?email=... request
    async function loginAs(typedEmail: string, typedPassword: string, apiAnswer: UserEntity[]) {
      type(email(), typedEmail);
      type(password(), typedPassword);
      await fixture.whenStable();

      button().click();

      const req = httpTesting.expectOne(
        (r) => r.url === `${environment.apiUrl}/people` && r.params.get('email') === typedEmail,
      );
      expect(req.request.method).toBe('GET');
      req.flush(apiAnswer); // 👈 the "server" answers
      await fixture.whenStable();
    }

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
      await loginAs('bob@email.bob', 'BobIsTheBest99#', [bob]);

      expect(html.textContent).toContain('Welcome, Bob Martin!');
    });

    it('shows an error with a wrong password', async () => {
      await loginAs('bob@email.bob', 'wrong', [bob]);

      expect(html.textContent).toContain('Wrong email or password');
    });

    it('shows an error with an unknown email', async () => {
      await loginAs('nobody@mail.com', 'whatever', []); // json-server found nobody

      expect(html.textContent).toContain('Wrong email or password');
    });
  });

  // ── With a FAKE AuthService (a "mock") ─────────────────────
  // Use a fake when you only want to test the component, not the service.
  describe('with a fake service', () => {
    const fakeAuth = {
      currentUser: signal(null),
      // always says "wrong password": an Observable that errors right away
      login: vi.fn().mockReturnValue(throwError(() => new Error('bad credentials'))),
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

      expect(fakeAuth.login).toHaveBeenCalledWith({ email: 'bob@email.bob', password: '1234' });
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
