import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { UserResponse } from '@core/responses/user.response';
import { RegisterRequest } from '@core/requests/register.request';
import { LoginRequest } from '@core/requests/login.request';
import { RoleEnum } from '@core/enums/role.enum';

// answer of /token/login and /token/register
export interface AuthResponse {
  token: string;
  user: UserResponse;
}

// the token payload: readable by anyone
export interface TokenPayload {
  sub: string; // user id
  name: string;
  email: string;
  role: RoleEnum;
  iat: number; // issued at (s)
  exp: number; // expires at (s)
}

// the user, read from the token
export interface TokenUser {
  id: number;
  name: string;
  email: string;
  role: RoleEnum;
}

const STORAGE_KEY = 'token';

// like BcryptAuthService, but the server checks + signs a JWT (kept in localStorage)
@Service()
export class TokenAuthService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.authUrl}/token`;

  // on load: a valid saved token logs you back in
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

  // expiresInSeconds: demo only
  login(request: LoginRequest, expiresInSeconds?: number): Observable<UserResponse> {
    return this._http
      .post<AuthResponse>(`${this._url}/login`, { ...request, expiresInSeconds })
      .pipe(
        tap((res) => this._setToken(res.token)),
        map((res) => res.user),
      );
  }

  // protected: needs the token
  me(): Observable<UserResponse> {
    return this._http.get<UserResponse>(`${this._url}/me`);
  }

  // admin only: 401 or 403 from the server
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
      // localStorage blocked: works until a refresh
    }
  }
}

// decode the payload: no secret needed
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
  return !payload || payload.exp * 1000 <= now; // exp in s, Date.now() in ms
}

// the saved token, if not expired
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
