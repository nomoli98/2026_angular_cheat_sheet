import { SchemaPath, validate, ValidationError } from '@angular/forms/signals';

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

        return errors.length ? errors : undefined;
    });
}
