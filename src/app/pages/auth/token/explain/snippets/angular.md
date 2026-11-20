```ts token-auth.service.ts
@Service()
export class TokenAuthService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.authUrl}/token`;

  // on load: saved token
  private readonly _token = signal<string | null>(readValidToken());
  readonly token = this._token.asReadonly();

  readonly payload = computed(() => decodeToken(this._token()));
  readonly currentUser = computed(() => {
    const p = this.payload();
    return p ? { id: Number(p.sub), name: p.name, email: p.email, role: p.role } : null;
  });

  login(request: LoginRequest): Observable<UserResponse> {
    return this._http.post<AuthResponse>(`${this._url}/login`, request).pipe(
      tap((res) => this._setToken(res.token)),
      map((res) => res.user),
    );
  }

  me(): Observable<UserResponse> {
    return this._http.get<UserResponse>(`${this._url}/me`); // the interceptor adds the token
  }

  logout(): void {
    this._setToken(null);
  }

  private _setToken(token: string | null): void {
    this._token.set(token);
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }
}

// read the payload (no secret)
export function decodeToken(token: string | null): TokenPayload | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}
```

```ts token.interceptor.ts
// core/interceptors/token.interceptor.ts
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(TokenAuthService);
  const token = auth.token();

  // our server only
  if (!token || !req.url.startsWith(environment.authUrl) || req.context.get(SKIP_TOKEN)) {
    return next(req);
  }

  // immutable → clone()
  const withToken = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(withToken).pipe(
    catchError((err) => {
      // 401 → logout
      if (err instanceof HttpErrorResponse && err.status === 401 && !req.url.endsWith('/login')) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
```

```ts app.config.ts
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from '@core/interceptors/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([tokenInterceptor])), // 👈
  ],
};
```

```ts environment.development.ts
export const environment = {
  apiUrl: 'http://localhost:3000', // json-server
  authUrl: 'http://localhost:3001', // auth-server.js
};
```
