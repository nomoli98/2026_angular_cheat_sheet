```ts compare
import { compare } from 'bcryptjs';

const ok = await compare('BobIsTheBest99#', storedHash); // true
const ko = await compare('wrong', storedHash);           // false

// ❌ never (new salt each time)
(await hash(typed, 10)) === storedHash; // always false
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
