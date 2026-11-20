import { UserResponse } from '@core/responses/user.response';
import { RoleEnum } from '@core/enums/role.enum';

// Small helpers used by every controller (and by the pages, guards, templates...).
// They take anything with an id and a role: a UserResponse, or the TokenUser read from a JWT.
type WithRole = Pick<UserResponse, 'id' | 'role'>;

export function isLoggedIn(user: UserResponse | null): user is UserResponse {
  return user !== null;
}

export function isAdmin(user: WithRole | null): boolean {
  return user?.role === RoleEnum.ADMIN;
}

// Admin, or the user working on their OWN account.
// Not used by UserController anymore (everything is admin only), kept as an example of a
// "you can only touch your own data" rule, see pages/auth/authorization/AUTHORIZATION.md
export function isAdminOrSelf(user: WithRole | null, id: number): boolean {
  return isAdmin(user) || user?.id === id;
}

// Throws the right error when the check fails, like an API would:
// - nobody logged in → 'unauthorized' (HTTP 401)
// - logged in, but not allowed → 'forbidden' (HTTP 403)
// Inside an async method, a throw becomes a rejected Promise.
export function deny(user: WithRole | null): never {
  throw new Error(user ? 'forbidden' : 'unauthorized');
}
