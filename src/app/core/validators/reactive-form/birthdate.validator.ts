import { ValidatorFn } from '@angular/forms';

interface BirthdateErrors {
  invalidDate?: boolean;
  minAge?: boolean;
  minAgeValue?: number;
  maxAge?: boolean;
  maxAgeValue?: number;
}

/**
 * Turns a 'YYYY-MM-DD' string (what <input type="date"> gives) into a local Date.
 * new Date('YYYY-MM-DD') would read it as UTC midnight, which can be the day before in your timezone.
 * Returns null if the string is not a real date (e.g. '2001-02-30').
 */
function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const date = new Date(+match[1], +match[2] - 1, +match[3]);
  return date.getMonth() === +match[2] - 1 ? date : null; // '02-30' would roll over to March
}

/** Today minus `years`, clamped like dayjs (Feb 29 → Feb 28 instead of rolling to Mar 1). */
function yearsAgo(years: number): Date {
  const date = new Date();
  const month = date.getMonth();
  date.setFullYear(date.getFullYear() - years);
  if (date.getMonth() !== month) {
    date.setDate(0); // go back to the last day of the previous month
  }
  return date;
}

export function birthdateValidator(minAge?: number, maxAge?: number): ValidatorFn {
  return (control) => {
    const value: string | null = control.value;
    if (!value) {
      return null; // let Validators.required handle empty values
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
