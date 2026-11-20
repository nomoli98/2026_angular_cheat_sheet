```ts environment.development.ts
// src/environments/environment.development.ts
export const environment = {
  apiUrl: 'http://localhost:3000',
};
```

```ts app.config.ts
// src/app/app.config.ts: turn on HttpClient ONCE for the whole app
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

  getAll(): Observable<UserEntity[]> {
    return this._http.get<UserEntity[]>(this._url); // GET /people
  }

  getOne(id: number): Observable<UserEntity> {
    return this._http.get<UserEntity>(`${this._url}/${id}`); // GET /people/1
  }

  create(request: RegisterRequest): Observable<UserEntity> {
    return this._http.post<UserEntity>(this._url, request); // POST /people
  }
}
```
