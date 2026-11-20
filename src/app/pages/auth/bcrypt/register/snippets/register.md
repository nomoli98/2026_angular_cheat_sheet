```ts bcrypt-auth.service.ts
// core/services/bcrypt-auth.service.ts
import { hash } from 'bcryptjs';

export const BCRYPT_ROUNDS = 10; // 2^10 rounds

register(request: RegisterRequest): Observable<UserResponse> {
  return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
    // 1. email free? → hash (async)
    switchMap(async (users) => {
      if (users.length > 0) throw new Error('email already taken');
      return hash(request.password, BCRYPT_ROUNDS); // '$2b$10$<salt><hash>'
    }),
    // 2. store the hash
    switchMap((passwordHash) =>
      this._http.post<UserEntity>(this._url, { ...request, password: passwordHash, role: RoleEnum.USER }),
    ),
    map((user) => UserMapper(user)), // the hash stays here
    tap((user) => this._currentUser.set(user)),
  );
}
```

```ts register.component.ts
// only the controller changes:
protected readonly _authController = inject(BcryptAuthController);

async onSubmit(event: Event) {
  event.preventDefault();
  if (this._form().invalid()) return;
  try {
    this._created.set(await this._authController.register(this._form().value()));
  } catch (err) {
    this._error.set(errorMessage(err)); // 'This email is already taken'
  }
}
```

```json db.json
"people": [
  { "id": 1, "email": "bob@email.bob", "password": "BobIsTheBest99#" }
],
"securePeople": [
  { "id": 1, "email": "bob@email.bob", "password": "$2b$10$xScyLRoTzCndQZvGgrzwquFPmyRK0V9fja7/TukOT1j7IXedYJMRS" }
]
```
