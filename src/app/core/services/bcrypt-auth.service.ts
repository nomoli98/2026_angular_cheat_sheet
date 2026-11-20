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

// Cost factor: bcrypt runs 2^10 = 1024 rounds. +1 = twice slower (for you AND for an attacker).
export const BCRYPT_ROUNDS = 10;

// SAME job as AuthService, but the password is stored as a bcrypt HASH, never as plain text.
// Its users live in another list: /securePeople (same people, hashed passwords).
//
// ⚠️ DEMO: here the hashing runs in the browser (bcryptjs). A real app sends the password
// over HTTPS and the SERVER hashes / compares it: the hash never comes back to the browser.
// The token version (TokenAuthService) does it the real way, on the server.
@Service()
export class BcryptAuthService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.apiUrl}/securePeople`;

  private readonly _currentUser = signal<UserResponse | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  register(request: RegisterRequest): Observable<UserResponse> {
    return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
      // 1. email taken? → error. Free → hash the password (async: bcrypt is slow ON PURPOSE)
      switchMap(async (users) => {
        if (users.length > 0) throw new Error('email already taken');
        return hash(request.password, BCRYPT_ROUNDS); // '$2b$10$<salt><hash>'
      }),
      // 2. store the HASH instead of the password
      switchMap((passwordHash) =>
        this._http.post<UserEntity>(this._url, {
          ...request,
          password: passwordHash,
          role: RoleEnum.USER,
        }),
      ),
      map((user) => UserMapper(user)), // the hash never leaves the service
      tap((user) => this._currentUser.set(user)), // logged in right away, like AuthService
    );
  }

  login(request: LoginRequest): Observable<UserResponse> {
    return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
      // compare() reads the salt inside the stored hash, hashes the typed password
      // with it, and checks both hashes are the same. You can't "decrypt" a hash.
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
