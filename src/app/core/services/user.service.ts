import { inject, Service } from '@angular/core';
import { RegisterRequest } from '@core/requests/register.request';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UserMapper } from '@core/mapper/user.mapper';
import { UserEntity } from '@core/entities/user.entity';
import { UserResponse } from '@core/responses/user.response';

@Service()
export class UserService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.apiUrl}/people`;
  private readonly _mapper = inject(UserMapper);

  create(request: RegisterRequest) {
    return this._http.post<UserEntity>(this._url, request).pipe(map((user) => this._mapper(user)));
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

  updateFully(id: number, request: RegisterRequest): Observable<UserResponse> {
    return this._http
      .put<UserEntity>(`${this._url}/${id}`, request)
      .pipe(map((user) => this._mapper(user)));
  }

  updatePartial(id: number, request: Partial<RegisterRequest>): Observable<UserResponse> {
    return this._http
      .patch<UserEntity>(`${this._url}/${id}`, request)
      .pipe(map((user) => this._mapper(user)));
  }

  delete(id: number) {
    this._http.delete<UserEntity>(`${this._url}/${id}`);
  }
}
