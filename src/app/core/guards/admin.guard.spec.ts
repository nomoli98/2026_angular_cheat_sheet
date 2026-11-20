import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
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
const alice: UserResponse = { ...bob, id: 2, name: 'Alice Dupont', role: RoleEnum.USER };

describe('adminGuard', () => {
    const currentUser = signal<UserResponse | null>(null);
    const url = '/auth/authorization/admin-area';

    // inject() → needs an injection context
    const runGuard = () =>
        TestBed.runInInjectionContext(() =>
            adminGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
        );

    beforeEach(() => {
        currentUser.set(null);
        TestBed.configureTestingModule({
            providers: [{ provide: AuthService, useValue: { currentUser } }],
        });
    });

    it('lets an admin in', () => {
        currentUser.set(bob);

        expect(runGuard()).toBe(true);
    });

    it('sends a simple user to the authorization page, saying what was blocked', () => {
        currentUser.set(alice);

        const result = runGuard() as UrlTree;

        expect(result).toBeInstanceOf(UrlTree);
        expect(result.toString()).toBe(
            '/auth/authorization?forbidden=%2Fauth%2Fauthorization%2Fadmin-area',
        );
    });

    it('sends a logged-out user to the auth page, with the returnUrl', () => {
        const result = runGuard() as UrlTree;

        expect(result.toString()).toBe(
            '/auth/auth-service?returnUrl=%2Fauth%2Fauthorization%2Fadmin-area',
        );
    });
});
