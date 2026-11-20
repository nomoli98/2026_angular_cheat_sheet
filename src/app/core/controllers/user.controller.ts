import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { UserResponse } from '@core/responses/user.response';
import { RegisterRequest } from '@core/requests/register.request';
import { deny, isAdmin } from '@core/controllers/permissions';

// Controller = like a backend controller: CHECK the permission, then call the service.
// The service returns an Observable, the controller turns it into a Promise (firstValueFrom),
// so the component just does `await controller.getAll()`.
//
// Rule: every CRUD method is ADMIN ONLY, except getMe() (anybody logged in reads themselves).
// The pages check isAdmin() too (to disable buttons), but THIS is the check that counts in the app:
// a component can forget it, the controller can't be skipped.
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

  // admin only
  async getOne(id: number): Promise<UserResponse> {
    const user = this._authService.currentUser();
    if (!isAdmin(user)) deny(user);
    return await firstValueFrom(this._userService.getOne(id));
  }

  // anybody logged in: reads their OWN account (no id needed, we know who is asking)
  async getMe(): Promise<UserResponse> {
    const user = this._authService.currentUser();
    if (!user) deny(user);
    return firstValueFrom(this._userService.getOne(user.id));
  }

  // admin only (people create their own account with AuthController.register)
  async create(request: RegisterRequest): Promise<UserResponse> {
    const user = this._authService.currentUser();
    if (!isAdmin(user)) deny(user);
    return firstValueFrom(this._userService.create(request));
  }

  // admin only
  async updateFully(id: number, request: RegisterRequest): Promise<UserResponse> {
    const user = this._authService.currentUser();
    if (!isAdmin(user)) deny(user);
    return firstValueFrom(this._userService.updateFully(id, request));
  }

  // admin only
  async updatePartial(id: number, changes: Partial<RegisterRequest>): Promise<UserResponse> {
    const user = this._authService.currentUser();
    if (!isAdmin(user)) deny(user);
    return firstValueFrom(this._userService.updatePartial(id, changes));
  }

  // admin only
  async delete(id: number): Promise<void> {
    const user = this._authService.currentUser();
    if (!isAdmin(user)) deny(user);
    // defaultValue: no error if the Observable ends without a value
    await firstValueFrom(this._userService.delete(id), { defaultValue: undefined });
  }
}
