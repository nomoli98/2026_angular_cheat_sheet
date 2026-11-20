```ts bcrypt-auth.service.ts
// core/services/bcrypt-auth.service.ts
import { compare } from 'bcryptjs';

login(request: LoginRequest): Observable<UserResponse> {
  return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
    // salt read from the hash
    switchMap(async ([user]) => {
      if (!user || !(await compare(request.password, user.password))) {
        throw new Error('bad credentials'); // same error for both
      }
      return UserMapper(user);
    }),
    tap((user) => this._currentUser.set(user)),
  );
}
```

```ts auth.service.ts
// core/services/auth.service.ts (plain version)
login(request: LoginRequest): Observable<UserResponse> {
  return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
    map((users) => {
      const user = users[0];
      if (!user || user.password !== request.password) throw new Error('bad credentials'); // 👈 plain text
      return UserMapper(user);
    }),
    tap((user) => this._currentUser.set(user)),
  );
}
```

```ts login.component.ts
// only these change:
protected readonly _authController = inject(BcryptAuthController);
protected readonly _currentUser = inject(BcryptAuthService).currentUser;
```
