import { inject, Service } from '@angular/core';
import { RegisterRequest } from '@core/requests/register.request';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap, throwError } from 'rxjs';
import { UserMapper } from '@core/mapper/user.mapper';
import { UserEntity } from '@core/entities/user.entity';
import { UserResponse } from '@core/responses/user.response';
import { RoleEnum } from '@core/enums/role.enum';

@Service()
export class UserService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.apiUrl}/people`;
  private readonly _mapper = UserMapper; // a function → no inject()

  create(request: RegisterRequest): Observable<UserResponse> {
    // new accounts are always users
    return this._http
      .post<UserEntity>(this._url, { ...request, role: RoleEnum.USER })
      .pipe(map((user) => this._mapper(user)));
  }

  getAll(): Observable<UserResponse[]> {
    return this._http.get<UserEntity[]>(this._url).pipe(
      map((users) => {
        return users.map((u) => this._mapper(u));
      }),
    );
  }

  getOne(id: number): Observable<UserResponse> {
    return this._http.get<UserEntity>(`${this._url}/${id}`).pipe(map((user) => this._mapper(user)));
  }

  exists(id: number): Observable<boolean> {
    return this._http
      .get<UserEntity[]>(this._url, { params: { id } })
      .pipe(map((users) => users.length > 0));
  }

  emailExists(email: string): Observable<boolean> {
    return this._http
      .get<UserEntity[]>(this._url, { params: { email } })
      .pipe(map((users) => users.length > 0));
  }

  // PUT replaces everything: keep the current role
  updateFully(id: number, request: RegisterRequest): Observable<UserResponse> {
    return this._http.get<UserEntity[]>(this._url, { params: { id } }).pipe(
      switchMap(([current]) =>
        current
          ? this._http.put<UserEntity>(`${this._url}/${id}`, { ...request, role: current.role })
          : throwError(() => new Error('user not found')),
      ),
      map((user) => this._mapper(user)),
    );
  }

  updatePartial(id: number, request: Partial<RegisterRequest>): Observable<UserResponse> {
    return this.ifExists(id, () =>
      this._http
        .patch<UserEntity>(`${this._url}/${id}`, request)
        .pipe(map((user) => this._mapper(user))),
    );
  }

  delete(id: number): Observable<void> {
    return this.ifExists(id, () => this._http.delete<void>(`${this._url}/${id}`));
  }

  private ifExists<T>(id: number, request: () => Observable<T>): Observable<T> {
    return this.exists(id).pipe(
      switchMap((found) => (found ? request() : throwError(() => new Error('user not found')))),
    );
  }
}
