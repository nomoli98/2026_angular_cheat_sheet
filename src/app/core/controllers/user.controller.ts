import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { UserResponse } from '@core/responses/user.response';
import { RegisterRequest } from '@core/requests/register.request';
import { deny, isAdmin, isAdminOrSelf } from '@core/controllers/permissions';

// Controller = like a backend controller: CHECK the permission, then call the service.
// The service returns an Observable, the controller turns it into a Promise (firstValueFrom),
// so the component just does `await controller.getAll()`.
@Service()
export class UserController {
  private readonly _userService = inject(UserService);
  private readonly _authService = inject(AuthService);

  // admin only
  async getAll(): Promise<UserResponse[]> {
    const user = this._authService.currentUser();
    if (!isAdmin(user)) deny(user);
    return firstValueFrom(this._userService.getAll());
  }

  // admin, or yourself
  async getOne(id: number): Promise<UserResponse> {
    const user = this._authService.currentUser();
    if (!isAdminOrSelf(user, id)) deny(user);
    return await firstValueFrom(this._userService.getOne(id));
  }

  // admin only (people create their own account with AuthController.register)
  async create(request: RegisterRequest): Promise<UserResponse> {
    const user = this._authService.currentUser();
    if (!isAdmin(user)) deny(user);
    return firstValueFrom(this._userService.create(request));
  }

  // admin, or yourself
  async updateFully(id: number, request: RegisterRequest): Promise<UserResponse> {
    const user = this._authService.currentUser();
    if (!isAdminOrSelf(user, id)) deny(user);
    return firstValueFrom(this._userService.updateFully(id, request));
  }

  // admin, or yourself
  async updatePartial(id: number, changes: Partial<RegisterRequest>): Promise<UserResponse> {
    const user = this._authService.currentUser();
    if (!isAdminOrSelf(user, id)) deny(user);
    return firstValueFrom(this._userService.updatePartial(id, changes));
  }

  // admin, or yourself
  async delete(id: number): Promise<void> {
    const user = this._authService.currentUser();
    if (!isAdminOrSelf(user, id)) deny(user);
    // defaultValue: no error if the Observable ends without a value
    await firstValueFrom(this._userService.delete(id), { defaultValue: undefined });
  }
}
