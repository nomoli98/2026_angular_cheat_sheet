import { UserResponse } from '@core/responses/user.response';
import { RoleEnum } from '@core/enums/role.enum';

// Small helpers used by every controller.

export function isLoggedIn(user: UserResponse | null): user is UserResponse {
  return user !== null;
}

export function isAdmin(user: UserResponse | null): boolean {
  return user?.role === RoleEnum.ADMIN;
}

// Admin, or the user working on their OWN account
export function isAdminOrSelf(user: UserResponse | null, id: number): boolean {
  return isAdmin(user) || user?.id === id;
}

// Throws the right error when the check fails, like an API would:
// - nobody logged in → 'unauthorized' (HTTP 401)
// - logged in, but not allowed → 'forbidden' (HTTP 403)
// Inside an async method, a throw becomes a rejected Promise.
export function deny(user: UserResponse | null): never {
  throw new Error(user ? 'forbidden' : 'unauthorized');
}
