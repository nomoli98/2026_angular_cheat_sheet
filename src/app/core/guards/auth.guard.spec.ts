import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
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

describe('authGuard', () => {
  const currentUser = signal<UserResponse | null>(null);

  // A guard is a function that uses inject() → run it inside an injection context
  const runGuard = (url: string) =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );

  beforeEach(() => {
    currentUser.set(null);
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: { currentUser } }],
    });
  });

  it('lets a logged-in user in', () => {
    currentUser.set(bob);

    expect(runGuard('/service/get-all')).toBe(true);
  });

  it('sends a logged-out user to the auth page, with the returnUrl', () => {
    const result = runGuard('/service/get-all') as UrlTree;

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/service/auth-service?returnUrl=%2Fservice%2Fget-all');
  });
});
