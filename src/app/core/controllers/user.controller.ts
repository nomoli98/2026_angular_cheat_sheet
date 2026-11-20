import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { UserResponse } from '@core/responses/user.response';
import { RegisterRequest } from '@core/requests/register.request';
import { deny, isAdmin } from '@core/controllers/permissions';

// checks the role, then calls the service. Admin only, except getMe()
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

  // anybody logged in: their own account
  async getMe(): Promise<UserResponse> {
    const user = this._authService.currentUser();
    if (!user) deny(user);
    return firstValueFrom(this._userService.getOne(user.id));
  }

  // admin only (users sign up with AuthController.register)
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
    // no EmptyError when nothing is emitted
    await firstValueFrom(this._userService.delete(id), { defaultValue: undefined });
  }
}
