import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { UserService } from '@core/services/user.service';
import { UserMapper } from '@core/mapper/user.mapper';
import { UserEntity } from '@core/entities/user.entity';
import { UserResponse } from '@core/responses/user.response';
import { RegisterRequest } from '@core/requests/register.request';
import { LoginRequest } from '@core/requests/login.request';

@Service()
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.apiUrl}/people`;
  private readonly _userService = inject(UserService);

  // The logged-in user, or null. Only the service can change it (asReadonly).
  private readonly _currentUser = signal<UserResponse | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  register(request: RegisterRequest): Observable<UserResponse> {
    return this._userService.create(request);
  }

  // Fake login: GET /people?email=... → [user] or [], then the password is checked HERE.
  login(request: LoginRequest): Observable<UserResponse> {
    return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
      map((users) => {
        const user = users[0];
        if (!user || user.password !== request.password) throw new Error('bad credentials');
        return UserMapper(user);
      }),
      tap((user) => this._currentUser.set(user)), // remember who is logged in
    );
  }

  logout(): void {
    this._currentUser.set(null);
  }
}
