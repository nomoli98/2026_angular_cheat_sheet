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

const alice: UserResponse = {
    ...bob,
    id: 2,
    name: 'Alice Dupont',
    email: 'alice.dupont@mail.com',
    role: RoleEnum.USER,
};

describe('AuthToggleService', () => {
    let toggle: AuthToggleService;

    // fake login() fills currentUser
    const currentUser = signal<UserResponse | null>(null);
    const fakeAuth = {
        currentUser,
        login: vi.fn((request: { email: string }) => {
            const user = request.email === alice.email ? alice : bob;
            currentUser.set(user);
            return of(user);
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

    describe('admin switch (Bob ↔ Alice)', () => {
        it('setRole(USER) logs in again as Alice and saves it', async () => {
            await toggle.init(); // Bob

            await toggle.setRole(RoleEnum.USER);

            expect(fakeAuth.login).toHaveBeenLastCalledWith({
                email: 'alice.dupont@mail.com',
                password: 'AliceIsTheBest99#',
            });
            expect(toggle.isAdmin()).toBe(false);
            expect(localStorage.getItem('auth-role')).toBe('user');
        });

        it('setRole(ADMIN) logs in again as Bob', async () => {
            await toggle.init();
            await toggle.setRole(RoleEnum.USER);

            await toggle.setRole(RoleEnum.ADMIN);

            expect(toggle.user()?.email).toBe('bob@email.bob');
            expect(toggle.isAdmin()).toBe(true);
        });

        it('when logged out, setRole() only remembers the choice (no login)', async () => {
            await toggle.setRole(RoleEnum.USER);

            expect(fakeAuth.login).not.toHaveBeenCalled();
            expect(toggle.role()).toBe(RoleEnum.USER);
        });

        it("init() logs in as Alice when 'user' was saved", async () => {
            localStorage.setItem('auth-role', 'user');
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [provideRouter([]), { provide: AuthService, useValue: fakeAuth }],
            });
            toggle = TestBed.inject(AuthToggleService); // reads localStorage on creation

            await toggle.init();

            expect(toggle.user()?.email).toBe('alice.dupont@mail.com');
        });
    });
});
