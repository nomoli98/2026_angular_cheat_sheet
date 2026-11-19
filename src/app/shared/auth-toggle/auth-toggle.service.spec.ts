import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthToggleService } from './auth-toggle.service';
import { AuthService } from '@core/services/auth.service';
import { UserResponse } from '@core/responses/user.response';
import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';
import { RoleEnum } from '@core/enums/role.enum';

const bob: UserResponse = {
  id: 1,
  name: 'Bob Martin',
  email: 'bob@email.bob',
  birthdate: '2000-09-22',
  height: 195,
  gender: GenderEnum.MALE,
  subscription: SubscriptionEnum.PREMIUM,
  role: RoleEnum.ADMIN,
};

describe('AuthToggleService', () => {
  let toggle: AuthToggleService;

  // Fake AuthService: login() fills currentUser like the real one
  const currentUser = signal<UserResponse | null>(null);
  const fakeAuth = {
    currentUser,
    login: vi.fn(() => {
      currentUser.set(bob);
      return of(bob);
    }),
    logout: vi.fn(() => currentUser.set(null)),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    currentUser.set(null);
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: fakeAuth }],
    });
    toggle = TestBed.inject(AuthToggleService);
  });

  it('init() logs in as Bob by default (nothing saved yet)', async () => {
    await toggle.init();

    expect(fakeAuth.login).toHaveBeenCalledWith({
      email: 'bob@email.bob',
      password: 'BobIsTheBest99#',
    });
    expect(toggle.isOn()).toBe(true);
  });

  it("init() stays logged out when the toggle was saved 'off'", async () => {
    localStorage.setItem('auth-toggle', 'off');

    await toggle.init();

    expect(fakeAuth.login).not.toHaveBeenCalled();
    expect(toggle.isOn()).toBe(false);
  });

  it('set(false) logs out and saves off, set(true) logs in and saves on', async () => {
    await toggle.set(true);
    expect(toggle.isOn()).toBe(true);
    expect(localStorage.getItem('auth-toggle')).toBe('on');

    await toggle.set(false);
    expect(fakeAuth.logout).toHaveBeenCalled();
    expect(toggle.isOn()).toBe(false);
    expect(localStorage.getItem('auth-toggle')).toBe('off');
  });

  it('explains when the API is not running', async () => {
    fakeAuth.login.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })));

    await toggle.init();

    expect(toggle.isOn()).toBe(false);
    expect(toggle.error()).toContain('npm run dev');
  });
});
