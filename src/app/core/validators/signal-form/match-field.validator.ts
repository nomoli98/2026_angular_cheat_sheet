import { SchemaPath, validate } from '@angular/forms/signals';

// Cross-field: valueOf() reads the other field
export function matchField(
  path: SchemaPath<string>,
  other: SchemaPath<string>,
  message = "Passwords don't match",
) {
  validate(path, ({ value, valueOf }) => {
    if (!value()) return undefined; // empty: required's job
    return value() === valueOf(other) ? undefined : { kind: 'mismatch', message };
  });
}
