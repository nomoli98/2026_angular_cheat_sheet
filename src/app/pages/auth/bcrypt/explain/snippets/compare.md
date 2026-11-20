```ts compare
import { compare } from 'bcryptjs';

const ok = await compare('BobIsTheBest99#', storedHash); // true
const ko = await compare('wrong', storedHash);           // false

// ❌ never: hash the typed password again and compare the strings
//    (new salt → always a different hash → always false)
(await hash(typed, 10)) === storedHash; // false, even with the right password
```

```ts in a service
login(request: LoginRequest): Observable<UserResponse> {
  return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
    switchMap(async ([user]) => {
      if (!user || !(await compare(request.password, user.password))) {
        throw new Error('bad credentials');
      }
      return UserMapper(user);
    }),
    tap((user) => this._currentUser.set(user)),
  );
}
```
