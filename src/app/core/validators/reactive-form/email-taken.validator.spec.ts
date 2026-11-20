import { TestBed } from '@angular/core/testing';
import { FormControl, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from '@core/services/user.service';
import { emailTakenValidator } from './email-taken.validator';

describe('emailTakenValidator', () => {
    // fake emailExists()
    const fakeUserService = { emailExists: vi.fn() };

    // runs the validator on a value
    function validate(value: string): Promise<ValidationErrors | null> {
        // inject() needs an injection context
        const validator = TestBed.runInInjectionContext(() => emailTakenValidator());
        const result$ = validator(new FormControl(value)) as Observable<ValidationErrors | null>;

        return new Promise((resolve) => {
            result$.subscribe(resolve);
            vi.advanceTimersByTime(400); // skip the wait
        });
    }

    beforeEach(() => {
        vi.useFakeTimers(); // no real wait
        vi.clearAllMocks();
        TestBed.configureTestingModule({
            providers: [{ provide: UserService, useValue: fakeUserService }],
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns { emailTaken: true } when the email exists', async () => {
        fakeUserService.emailExists.mockReturnValue(new Observable((s) => s.next(true)));

        expect(await validate('bob@email.bob')).toEqual({ emailTaken: true });
        expect(fakeUserService.emailExists).toHaveBeenCalledWith('bob@email.bob');
    });

    it('returns null when the email is free', async () => {
        fakeUserService.emailExists.mockReturnValue(new Observable((s) => s.next(false)));

        expect(await validate('new@mail.com')).toBeNull();
    });

    it('does not call the API for an empty value', async () => {
        expect(await validate('')).toBeNull();
        expect(fakeUserService.emailExists).not.toHaveBeenCalled();
    });
});
