import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap, tap } from 'rxjs';
import { compare, hash } from 'bcryptjs';
import { environment } from '@env/environment';
import { UserMapper } from '@core/mapper/user.mapper';
import { UserEntity } from '@core/entities/user.entity';
import { UserResponse } from '@core/responses/user.response';
import { RegisterRequest } from '@core/requests/register.request';
import { LoginRequest } from '@core/requests/login.request';
import { RoleEnum } from '@core/enums/role.enum';

// 2^10 rounds, +1 = twice slower
export const BCRYPT_ROUNDS = 10;

// AuthService with bcrypt hashes (/securePeople). ⚠️ demo: real apps hash on the server
@Service()
export class BcryptAuthService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.apiUrl}/securePeople`;

  private readonly _currentUser = signal<UserResponse | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  register(request: RegisterRequest): Observable<UserResponse> {
    return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
      // 1. email taken? else hash (slow on purpose)
      switchMap(async (users) => {
        if (users.length > 0) throw new Error('email already taken');
        return hash(request.password, BCRYPT_ROUNDS); // '$2b$10$<salt><hash>'
      }),
      // 2. store the hash
      switchMap((passwordHash) =>
        this._http.post<UserEntity>(this._url, {
          ...request,
          password: passwordHash,
          role: RoleEnum.USER,
        }),
      ),
      map((user) => UserMapper(user)), // the hash never leaves the service
      tap((user) => this._currentUser.set(user)), // logged in right away
    );
  }

  login(request: LoginRequest): Observable<UserResponse> {
    return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
      // reads the salt from the hash, re-hashes, compares
      switchMap(async ([user]) => {
        if (!user || !(await compare(request.password, user.password))) {
          throw new Error('bad credentials');
        }
        return UserMapper(user);
      }),
      tap((user) => this._currentUser.set(user)),
    );
  }

  logout(): void {
    this._currentUser.set(null);
  }
}
