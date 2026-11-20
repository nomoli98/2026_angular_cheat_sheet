import { SchemaPath, validateHttp } from '@angular/forms/signals';
import { UserEntity } from '@core/entities/user.entity';
import { environment } from '@env/environment';

// Async: GET /people?email=... (runs only when the sync rules pass)
export function emailTaken(path: SchemaPath<string>) {
  validateHttp(path, {
    request: ({ value }) =>
      value() ? { url: `${environment.apiUrl}/people`, params: { email: value() } } : undefined,
    onSuccess: (users: UserEntity[]) =>
      users.length > 0 ? { kind: 'emailTaken', message: 'This email is already taken' } : undefined,
    onError: () => ({ kind: 'serverError', message: 'Could not check the email' }),
    debounce: 400,
  });
}
