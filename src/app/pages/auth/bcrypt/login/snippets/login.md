```ts bcrypt-auth.service.ts
// core/services/bcrypt-auth.service.ts
import { compare } from 'bcryptjs';

login(request: LoginRequest): Observable<UserResponse> {
  return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
    // compare() reads the salt inside the stored hash, hashes the typed password
    // with it, and checks both hashes are the same. You can't "decrypt" a hash.
    switchMap(async ([user]) => {
      if (!user || !(await compare(request.password, user.password))) {
        throw new Error('bad credentials'); // same error: don't tell which one was wrong
      }
      return UserMapper(user);
    }),
    tap((user) => this._currentUser.set(user)),
  );
}
```

```ts auth.service.ts
// core/services/auth.service.ts: the plain version, for comparison
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
// Same component as the normal Login page, only these change:
protected readonly _authController = inject(BcryptAuthController);
protected readonly _currentUser = inject(BcryptAuthService).currentUser;
```
