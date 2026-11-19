import { inject, Service } from '@angular/core';
import { RegisterRequest } from '@core/requests/register.request';
import { UserService } from '@core/services/user.service';
import { UserEntity } from '@core/entities/user.entity';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { LoginRequest } from '@core/requests/login.request';

@Service()
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.apiUrl}/people`;
  private readonly _userservice = inject(UserService);

  register(request: RegisterRequest) {
    this._userservice.create(request);
  }

  login(request: LoginRequest) {
    const res =this._http.get<UserEntity>(`${this._url}`, request.email);
    if (res.password !== request.password) throw new Error('bad credentials');
    return res;
  }

  logout() {}
}
