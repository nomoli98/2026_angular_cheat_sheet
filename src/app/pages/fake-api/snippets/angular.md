```ts environment.development.ts
// src/environments/environment.development.ts
export const environment = {
    apiUrl: 'http://localhost:3000',
};
```

```ts app.config.ts
// src/app/app.config.ts
export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(withFetch()),
        // ...
    ],
};
```

```ts user.service.ts
@Service()
export class UserService {
    private readonly _http = inject(HttpClient);
    private readonly _url = `${environment.apiUrl}/people`;
    private readonly _mapper = UserMapper; // drops the password

    getAll(): Observable<UserResponse[]> {
        return this._http
            .get<UserEntity[]>(this._url) // GET /people
            .pipe(map((users) => users.map((u) => this._mapper(u))));
    }

    getOne(id: number): Observable<UserResponse> {
        return this._http
            .get<UserEntity>(`${this._url}/${id}`) // GET /people/1
            .pipe(map((user) => this._mapper(user)));
    }

    create(request: RegisterRequest): Observable<UserResponse> {
        return this._http
            .post<UserEntity>(this._url, { ...request, role: RoleEnum.USER }) // POST /people
            .pipe(map((user) => this._mapper(user)));
    }
}
```
