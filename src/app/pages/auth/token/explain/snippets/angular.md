```ts token-auth.service.ts
@Service()
export class TokenAuthService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.authUrl}/token`;

  // read once on page load: a saved, not-expired token = still logged in
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
    return this._http.get<UserResponse>(`${this._url}/me`); // no header here: the interceptor adds it
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

// header.payload.signature → read the payload (base64url). No secret needed to READ.
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
// core/interceptors/token.interceptor.ts: runs for EVERY HttpClient request
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(TokenAuthService);
  const token = auth.token();

  // only to OUR auth server: never send the token to another site
  if (!token || !req.url.startsWith(environment.authUrl) || req.context.get(SKIP_TOKEN)) {
    return next(req);
  }

  // requests are immutable → clone() with the header
  const withToken = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(withToken).pipe(
    catchError((err) => {
      // 401 = the server doesn't accept our token anymore (expired, invalid) → log out
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
  apiUrl: 'http://localhost:3000', // json-server: the data
  authUrl: 'http://localhost:3001', // auth-server.js: bcrypt + JWT
};
```
