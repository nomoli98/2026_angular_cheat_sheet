import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { AuthController } from './auth.controller';
import { AuthService } from '@core/services/auth.service';
import { UserResponse } from '@core/responses/user.response';
import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';

const bob: UserResponse = {
  id: 1,
  name: 'Bob Martin',
  email: 'bob@email.bob',
  birthdate: '2000-09-22',
  height: 195,
  gender: GenderEnum.MALE,
  subscription: SubscriptionEnum.PREMIUM,
};

describe('AuthController', () => {
  let controller: AuthController;

  // Fake AuthService: each test decides what login/register answer
  const fakeAuthService = {
    currentUser: signal<UserResponse | null>(null),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: fakeAuthService }],
    });
    controller = TestBed.inject(AuthController);
  });

  it('is loading while the service has not answered yet', () => {
    const answer = new Subject<UserResponse>(); // an Observable WE complete later
    fakeAuthService.login.mockReturnValue(answer);

    controller.login({ email: 'bob@email.bob', password: 'BobIsTheBest99#' });
    expect(controller.loading()).toBe(true);

    answer.next(bob);
    answer.complete();
    expect(controller.loading()).toBe(false);
  });

  it('calls onSuccess after a good login', () => {
    fakeAuthService.login.mockReturnValue(of(bob));
    const onSuccess = vi.fn();

    controller.login({ email: 'bob@email.bob', password: 'BobIsTheBest99#' }, onSuccess);

    expect(onSuccess).toHaveBeenCalled();
    expect(controller.error()).toBeNull();
  });

  it('turns "bad credentials" into a readable error', () => {
    fakeAuthService.login.mockReturnValue(throwError(() => new Error('bad credentials')));

    controller.login({ email: 'bob@email.bob', password: 'wrong' });

    expect(controller.error()).toBe('Wrong email or password');
    expect(controller.loading()).toBe(false);
  });

  it('explains when the API is down', () => {
    fakeAuthService.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));

    controller.login({ email: 'bob@email.bob', password: 'x' });

    expect(controller.error()).toContain('not reachable');
  });

  it('shows "email already taken" on register', () => {
    fakeAuthService.register.mockReturnValue(throwError(() => new Error('email already taken')));
    const onSuccess = vi.fn();

    controller.register({ ...bob, password: 'x', agreeToTerms: true }, onSuccess);

    expect(controller.error()).toBe('This email is already taken');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('logout clears the error and calls the service', () => {
    fakeAuthService.login.mockReturnValue(throwError(() => new Error('bad credentials')));
    controller.login({ email: 'bob@email.bob', password: 'wrong' });

    controller.logout();

    expect(fakeAuthService.logout).toHaveBeenCalled();
    expect(controller.error()).toBeNull();
  });
});
