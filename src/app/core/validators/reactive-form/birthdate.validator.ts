import { ValidatorFn } from '@angular/forms';

interface BirthdateErrors {
    invalidDate?: boolean;
    minAge?: boolean;
    minAgeValue?: number;
    maxAge?: boolean;
    maxAgeValue?: number;
}

/** 'YYYY-MM-DD' → local Date (not UTC), or null if not a real date. */
function parseDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        return null;
    }
    const date = new Date(+match[1], +match[2] - 1, +match[3]);
    return date.getMonth() === +match[2] - 1 ? date : null; // '02-30' would roll over
}

/** Today minus `years` (Feb 29 → Feb 28). */
function yearsAgo(years: number): Date {
    const date = new Date();
    const month = date.getMonth();
    date.setFullYear(date.getFullYear() - years);
    if (date.getMonth() !== month) {
        date.setDate(0); // last day of the previous month
    }
    return date;
}

export function birthdateValidator(minAge?: number, maxAge?: number): ValidatorFn {
    return (control) => {
        const value: string | null = control.value;
        if (!value) {
            return null; // empty: required() handles it
        }

        const userBirthdate = parseDate(value);
        if (!userBirthdate) {
            return { invalidDate: true };
        }

        const result: BirthdateErrors = {};

        if (minAge && yearsAgo(minAge) < userBirthdate) {
            result.minAge = true;
            result.minAgeValue = minAge;
        }

        if (maxAge && yearsAgo(maxAge) > userBirthdate) {
            result.maxAge = true;
            result.maxAgeValue = maxAge;
        }

        return Object.keys(result).length > 0 ? result : null;
    };
}
