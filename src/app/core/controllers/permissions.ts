import { UserResponse } from '@core/responses/user.response';
import { RoleEnum } from '@core/enums/role.enum';

// helpers for controllers, guards, templates (UserResponse or TokenUser)
type WithRole = Pick<UserResponse, 'id' | 'role'>;

export function isLoggedIn(user: UserResponse | null): user is UserResponse {
    return user !== null;
}

export function isAdmin(user: WithRole | null): boolean {
    return user?.role === RoleEnum.ADMIN;
}

// example only: not used by UserController
export function isAdminOrSelf(user: WithRole | null, id: number): boolean {
    return isAdmin(user) || user?.id === id;
}

// throws 'unauthorized' (401) or 'forbidden' (403)
export function deny(user: WithRole | null): never {
    throw new Error(user ? 'forbidden' : 'unauthorized');
}
