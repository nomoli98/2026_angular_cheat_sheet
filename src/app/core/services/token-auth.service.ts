import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { UserResponse } from '@core/responses/user.response';
import { RegisterRequest } from '@core/requests/register.request';
import { LoginRequest } from '@core/requests/login.request';
import { RoleEnum } from '@core/enums/role.enum';

// What the auth server answers to /token/login and /token/register
export interface AuthResponse {
  token: string;
  user: UserResponse;
}

// What is INSIDE the token (the middle part). Anybody can read it: it's only base64.
export interface TokenPayload {
  sub: string; // "subject" = the user id
  name: string;
  email: string;
  role: RoleEnum;
  iat: number; // issued at (seconds since 1970)
  exp: number; // expires at (seconds since 1970)
}

// The logged-in user, as far as the token knows
export interface TokenUser {
  id: number;
  name: string;
  email: string;
  role: RoleEnum;
}

const STORAGE_KEY = 'token';

// SAME job as BcryptAuthService (register, login, logout, who is logged in), but:
// - the SERVER (fake-api/auth-server.js) checks the bcrypt hash, not the browser
// - the server answers a signed JWT; we keep it in localStorage → still logged in after a refresh
// - tokenInterceptor adds it to every request to the auth server (Authorization: Bearer ...)
@Service()
export class TokenAuthService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.authUrl}/token`;

  // Read once when the service is created (= on page load): a valid saved token logs you back in
  private readonly _token = signal<string | null>(readValidToken());
  readonly token = this._token.asReadonly();

  readonly payload = computed(() => decodeToken(this._token()));
  readonly currentUser = computed<TokenUser | null>(() => {
    const p = this.payload();
    return p ? { id: Number(p.sub), name: p.name, email: p.email, role: p.role } : null;
  });

  register(request: RegisterRequest): Observable<UserResponse> {
    return this._http.post<AuthResponse>(`${this._url}/register`, request).pipe(
      tap((res) => this._setToken(res.token)),
      map((res) => res.user),
    );
  }

  // expiresInSeconds: DEMO only, to see a token expire on the explain page
  login(request: LoginRequest, expiresInSeconds?: number): Observable<UserResponse> {
    return this._http
      .post<AuthResponse>(`${this._url}/login`, { ...request, expiresInSeconds })
      .pipe(
        tap((res) => this._setToken(res.token)),
        map((res) => res.user),
      );
  }

  // A PROTECTED route: the interceptor adds the token, the server checks it
  me(): Observable<UserResponse> {
    return this._http.get<UserResponse>(`${this._url}/me`);
  }

  // ADMIN only, checked by the SERVER: 401 (no/bad token) or 403 (not admin)
  getUsers(): Observable<UserResponse[]> {
    return this._http.get<UserResponse[]>(`${this._url}/users`);
  }

  logout(): void {
    this._setToken(null);
  }

  private _setToken(token: string | null): void {
    this._token.set(token);
    try {
      if (token) localStorage.setItem(STORAGE_KEY, token);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage blocked (private mode...): the login still works until a refresh
    }
  }
}

// header.payload.signature → JSON.parse(base64url-decode(payload)). No secret needed to READ.
export function decodeToken(token: string | null): TokenPayload | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as TokenPayload;
  } catch {
    return null; // not a JWT
  }
}

export function isExpired(payload: TokenPayload | null, now = Date.now()): boolean {
  return !payload || payload.exp * 1000 <= now; // exp is in SECONDS, Date.now() in ms
}

// The saved token, only if it's still valid (an expired one is thrown away)
function readValidToken(): string | null {
  try {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token && !isExpired(decodeToken(token))) return token;
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage blocked
  }
  return null;
}
