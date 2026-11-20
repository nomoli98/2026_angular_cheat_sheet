```bash terminal
npm install bcryptjs   # pure JavaScript: works in the browser AND in Node
                       # (the "bcrypt" package is native C++: Node only)
```

```ts hash
import { hash } from 'bcryptjs';

const passwordHash = await hash('BobIsTheBest99#', 10); // 10 = cost (2^10 rounds)
// '$2b$10$xScyLRoTzCndQZvGgrzwquFPmyRK0V9fja7/TukOT1j7IXedYJMRS'
//  algo cost  salt (22 chars)       hash (31 chars)
```

```ts in a service
// hash() returns a Promise. In an Observable chain, switchMap accepts an async function:
register(request: RegisterRequest): Observable<UserResponse> {
  return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
    switchMap(async (users) => {
      if (users.length > 0) throw new Error('email already taken');
      return hash(request.password, BCRYPT_ROUNDS);
    }),
    switchMap((passwordHash) =>
      this._http.post<UserEntity>(this._url, { ...request, password: passwordHash, role: RoleEnum.USER }),
    ),
    map((user) => UserMapper(user)),
  );
}
```
