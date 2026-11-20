import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TokenAuthService, TokenUser } from '@core/services/token-auth.service';
import { UserResponse } from '@core/responses/user.response';
import { LoginRequest } from '@core/requests/login.request';
import { RegisterRequest } from '@core/requests/register.request';
import { deny, isAdmin } from '@core/controllers/permissions';

// Same as BcryptAuthController, for the token version. The pages only see Promises.
@Service()
export class TokenAuthController {
  private readonly _authService = inject(TokenAuthService);

  // public
  async login(request: LoginRequest, expiresInSeconds?: number): Promise<UserResponse> {
    return firstValueFrom(this._authService.login(request, expiresInSeconds));
  }

  // public
  async register(request: RegisterRequest): Promise<UserResponse> {
    return firstValueFrom(this._authService.register(request));
  }

  // logged in only. The SERVER checks the token too (that's the real check)
  async me(): Promise<UserResponse> {
    if (!this._authService.currentUser()) deny(null);
    return firstValueFrom(this._authService.me());
  }

  // admin only. Checked HERE (no useless request) and AGAIN by the server (the real check):
  // try it with the role switched off here → the server still answers 403
  async getUsers(skipFrontCheck = false): Promise<UserResponse[]> {
    const user = this._authService.currentUser();
    if (!skipFrontCheck && !isAdmin(user)) deny(user);
    return firstValueFrom(this._authService.getUsers());
  }

  // logged in only
  async logout(): Promise<void> {
    const user: TokenUser | null = this._authService.currentUser();
    if (!user) deny(null);
    this._authService.logout();
  }
}
