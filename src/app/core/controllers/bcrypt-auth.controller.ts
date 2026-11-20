import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BcryptAuthService } from '@core/services/bcrypt-auth.service';
import { UserResponse } from '@core/responses/user.response';
import { LoginRequest } from '@core/requests/login.request';
import { RegisterRequest } from '@core/requests/register.request';
import { deny, isLoggedIn } from '@core/controllers/permissions';

// AuthController, bcrypt version
@Service()
export class BcryptAuthController {
    private readonly _authService = inject(BcryptAuthService);

    // public
    async login(request: LoginRequest): Promise<UserResponse> {
        return firstValueFrom(this._authService.login(request));
    }

    // public
    async register(request: RegisterRequest): Promise<UserResponse> {
        return firstValueFrom(this._authService.register(request));
    }

    // logged in only
    async logout(): Promise<void> {
        const user = this._authService.currentUser();
        if (!isLoggedIn(user)) deny(user);
        this._authService.logout();
    }
}
