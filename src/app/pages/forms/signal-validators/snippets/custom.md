```ts strong-password.validator.ts
import { SchemaPath, validate, ValidationError } from '@angular/forms/signals';

// reusable rule
export function strongPassword(path: SchemaPath<string>) {
    validate(path, ({ value }) => {
        const v = value() ?? '';
        const errors: ValidationError[] = [];

        if (!/[a-z]/.test(v))
            errors.push({ kind: 'lowercase', message: 'At least one lowercase letter' });
        if (!/[A-Z]/.test(v))
            errors.push({ kind: 'uppercase', message: 'At least one uppercase letter' });
        if (!/[0-9]/.test(v)) errors.push({ kind: 'number', message: 'At least one digit' });
        if (!/[\W_]/.test(v))
            errors.push({ kind: 'specialChar', message: 'At least one special character' });
        if (v.length < 8) errors.push({ kind: 'minlength', message: 'At least 8 characters' });

        // undefined = valid
        return errors.length ? errors : undefined;
    });
}
```

```ts birthdate.validator.ts
// with parameters
export function birthdate(path: SchemaPath<string>, opts: { minAge?: number; maxAge?: number }) {
    validate(path, ({ value }) => {
        const v = value();
        if (!v) return undefined; // empty: required's job

        const date = toDate(v); // 'YYYY-MM-DD' → local Date
        if (!date) return { kind: 'invalidDate', message: 'Invalid date' };

        const age = getAge(date);
        const errors: ValidationError[] = [];
        if (opts.minAge !== undefined && age < opts.minAge) {
            errors.push({
                kind: 'minAge',
                message: `You must be at least ${opts.minAge} years old`,
            });
        }
        if (opts.maxAge !== undefined && age > opts.maxAge) {
            errors.push({
                kind: 'maxAge',
                message: `You must be at most ${opts.maxAge} years old`,
            });
        }
        return errors.length ? errors : undefined;
    });
}
```

```ts signal-validators.component.ts
customModel = signal({ password: '', birthdate: '' });

customForm = form(this.customModel, (field) => {
    required(field.password, { message: 'Password is required' });
    strongPassword(field.password); // custom rule

    required(field.birthdate, { message: 'Birthdate is required' });
    birthdate(field.birthdate, { minAge: 18, maxAge: 120 }); // with parameters
});
```
