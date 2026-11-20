import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { AuthController } from './auth.controller';
import { AuthService } from '@core/services/auth.service';
import { UserResponse } from '@core/responses/user.response';
import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';
import { RoleEnum } from '@core/enums/role.enum';

const alice: UserResponse = {
    id: 2,
    name: 'Alice Dupont',
    email: 'alice@mail.com',
    birthdate: '1995-03-14',
    height: 168,
    gender: GenderEnum.FEMALE,
    subscription: SubscriptionEnum.FREE,
    role: RoleEnum.USER,
};

describe('AuthController', () => {
    let controller: AuthController;

    const currentUser = signal<UserResponse | null>(null);
    const fakeAuthService = {
        currentUser,
        login: vi.fn().mockReturnValue(of(alice)),
        register: vi.fn().mockReturnValue(of(alice)),
        logout: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        currentUser.set(null);
        TestBed.configureTestingModule({
            providers: [{ provide: AuthService, useValue: fakeAuthService }],
        });
        controller = TestBed.inject(AuthController);
    });

    it('login is public: works when nobody is logged in', async () => {
        const request = { email: 'alice@mail.com', password: 'AliceIsTheBest99#' };

        expect(await controller.login(request)).toEqual(alice);
        expect(fakeAuthService.login).toHaveBeenCalledWith(request);
    });

    it('logout is unauthorized when nobody is logged in', async () => {
        await expect(controller.logout()).rejects.toThrow('unauthorized');
        expect(fakeAuthService.logout).not.toHaveBeenCalled();
    });

    it('logout works when logged in', async () => {
        currentUser.set(alice);

        await controller.logout();

        expect(fakeAuthService.logout).toHaveBeenCalled();
    });
});
