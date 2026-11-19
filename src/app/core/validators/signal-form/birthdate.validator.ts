// birthdate.ts
import { SchemaPath, validate, ValidationError } from '@angular/forms/signals';

/**
 * Turns a 'YYYY-MM-DD' string (what <input type="date"> gives) into a local Date.
 * new Date('YYYY-MM-DD') would read it as UTC midnight, which can be the day before in your timezone.
 * Returns null if the string is not a real date (e.g. '2001-02-30').
 */
function toDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const date = new Date(+m[1], +m[2] - 1, +m[3]);
  return date.getMonth() === +m[2] - 1 ? date : null; // '02-30' would roll over to March
}

function getAge(birth: Date, today = new Date()): number {
  const age = today.getFullYear() - birth.getFullYear();
  const birthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  return birthdayPassed ? age : age - 1;
}

export function birthdate(path: SchemaPath<string>, opts: { minAge?: number; maxAge?: number }) {
  validate(path, ({ value }) => {
    const v = value();
    if (!v) return undefined; // let required() handle empty

    const date = toDate(v);
    if (!date) return { kind: 'invalidDate', message: 'Invalid date' };

    const age = getAge(date);
    const errors: ValidationError[] = [];

    if (opts.minAge !== undefined && age < opts.minAge) {
      errors.push({ kind: 'minAge', message: `You must be at least ${opts.minAge} years old` });
    }
    if (opts.maxAge !== undefined && age > opts.maxAge) {
      errors.push({ kind: 'maxAge', message: `You must be at most ${opts.maxAge} years old` });
    }

    return errors.length ? errors : undefined;
  });
}
