import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { UserController } from './user.controller';
import { UserService } from '@core/services/user.service';
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
const alice: UserResponse = {
    ...bob,
    id: 2,
    name: 'Alice Dupont',
    email: 'alice@mail.com',
    role: RoleEnum.USER,
};

describe('UserController', () => {
    let controller: UserController;

    // fake AuthService: the test picks the user
    const currentUser = signal<UserResponse | null>(null);
    const fakeAuthService = { currentUser };

    // fake UserService: answers with of(...)
    const fakeUserService = {
        getAll: vi.fn().mockReturnValue(of([bob, alice])),
        getOne: vi.fn().mockReturnValue(of(alice)),
        create: vi.fn().mockReturnValue(of(alice)),
        updateFully: vi.fn().mockReturnValue(of(alice)),
        updatePartial: vi.fn().mockReturnValue(of(alice)),
        delete: vi.fn().mockReturnValue(of(undefined)),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        currentUser.set(null);
        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: fakeAuthService },
                { provide: UserService, useValue: fakeUserService },
            ],
        });
        controller = TestBed.inject(UserController);
    });

    describe('getAll (admin only)', () => {
        it('returns the list for an admin', async () => {
            currentUser.set(bob);

            expect(await controller.getAll()).toEqual([bob, alice]);
        });

        it('is forbidden for a simple user, and the service is NOT called', async () => {
            currentUser.set(alice);

            await expect(controller.getAll()).rejects.toThrow('forbidden');
            expect(fakeUserService.getAll).not.toHaveBeenCalled();
        });

        it('is unauthorized when nobody is logged in', async () => {
            await expect(controller.getAll()).rejects.toThrow('unauthorized');
        });
    });

    describe('getOne / update / delete (admin only)', () => {
        it('an admin can read anybody', async () => {
            currentUser.set(bob);

            expect(await controller.getOne(2)).toEqual(alice);
        });

        it('a user cannot read an account, not even their own', async () => {
            currentUser.set(alice);

            await expect(controller.getOne(2)).rejects.toThrow('forbidden');
            expect(fakeUserService.getOne).not.toHaveBeenCalled();
        });

        it('an admin can update anybody', async () => {
            currentUser.set(bob);

            await controller.updatePartial(2, { height: 170 });

            expect(fakeUserService.updatePartial).toHaveBeenCalledWith(2, { height: 170 });
        });

        it('a user cannot update an account, not even their own', async () => {
            currentUser.set(alice);

            await expect(controller.updatePartial(2, { height: 170 })).rejects.toThrow('forbidden');
            await expect(
                controller.updateFully(2, {} as Parameters<UserController['updateFully']>[1]),
            ).rejects.toThrow('forbidden');
            expect(fakeUserService.updatePartial).not.toHaveBeenCalled();
            expect(fakeUserService.updateFully).not.toHaveBeenCalled();
        });

        it('an admin can delete anybody', async () => {
            currentUser.set(bob);

            await controller.delete(2);

            expect(fakeUserService.delete).toHaveBeenCalledWith(2);
        });

        it('a user cannot delete an account, not even their own', async () => {
            currentUser.set(alice);

            await expect(controller.delete(2)).rejects.toThrow('forbidden');
            expect(fakeUserService.delete).not.toHaveBeenCalled();
        });

        it('everything is unauthorized when nobody is logged in', async () => {
            await expect(controller.getOne(2)).rejects.toThrow('unauthorized');
            await expect(controller.delete(2)).rejects.toThrow('unauthorized');
        });
    });

    describe('getMe (anybody logged in)', () => {
        it('reads the account of the logged in user', async () => {
            currentUser.set(alice);

            expect(await controller.getMe()).toEqual(alice);
            expect(fakeUserService.getOne).toHaveBeenCalledWith(2);
        });

        it('is unauthorized when nobody is logged in', async () => {
            await expect(controller.getMe()).rejects.toThrow('unauthorized');
            expect(fakeUserService.getOne).not.toHaveBeenCalled();
        });
    });

    describe('create (admin only)', () => {
        it('is forbidden for a simple user', async () => {
            currentUser.set(alice);
            const { id: _id, role: _role, ...request } = alice;

            await expect(
                controller.create({ ...request, password: 'x', agreeToTerms: true }),
            ).rejects.toThrow('forbidden');
        });
    });
});
