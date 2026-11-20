import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SKIP_TOKEN, tokenInterceptor } from './token.interceptor';
import { TokenAuthService } from '@core/services/token-auth.service';
import { environment } from '@env/environment';

describe('tokenInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  const token = signal<string | null>('abc.def.ghi');
  const fakeAuth = { token, logout: vi.fn(() => token.set(null)) };

  beforeEach(() => {
    vi.clearAllMocks();
    token.set('abc.def.ghi');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])), // 👈 the interceptor under test
        provideHttpClientTesting(),
        { provide: TokenAuthService, useValue: fakeAuth },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('adds the token to requests to the auth server', () => {
    http.get(`${environment.authUrl}/token/me`).subscribe();

    const req = httpTesting.expectOne(`${environment.authUrl}/token/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
    req.flush({});
  });

  it('never sends the token to another server', () => {
    http.get(`${environment.apiUrl}/people`).subscribe();

    const req = httpTesting.expectOne(`${environment.apiUrl}/people`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('sends nothing when SKIP_TOKEN is set', () => {
    http
      .get(`${environment.authUrl}/token/me`, { context: new HttpContext().set(SKIP_TOKEN, true) })
      .subscribe();

    const req = httpTesting.expectOne(`${environment.authUrl}/token/me`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('logs out on a 401, and the caller still gets the error', async () => {
    const result = firstValueFrom(http.get(`${environment.authUrl}/token/me`));
    httpTesting
      .expectOne(`${environment.authUrl}/token/me`)
      .flush({ message: 'token expired' }, { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toMatchObject({ status: 401 });
    expect(fakeAuth.logout).toHaveBeenCalled();
  });

  it('does NOT log out on a wrong password (401 on /login)', async () => {
    const result = firstValueFrom(http.post(`${environment.authUrl}/token/login`, {}));
    httpTesting
      .expectOne(`${environment.authUrl}/token/login`)
      .flush({ message: 'bad credentials' }, { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toMatchObject({ status: 401 });
    expect(fakeAuth.logout).not.toHaveBeenCalled();
  });
});
