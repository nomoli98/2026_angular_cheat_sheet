import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { decodeToken, isExpired, TokenAuthService } from './token-auth.service';
import { RoleEnum } from '@core/enums/role.enum';
import { environment } from '@env/environment';

// the browser never checks the signature: a fake is fine
function fakeToken(expInSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: '1',
    name: 'Bob Martin',
    email: 'bob@email.bob',
    role: RoleEnum.ADMIN,
    iat: now,
    exp: now + expInSeconds,
  };
  const b64 = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.signature`;
}

const bob = { id: 1, name: 'Bob Martin', email: 'bob@email.bob' };

describe('TokenAuthService', () => {
  let httpTesting: HttpTestingController;

  // read on creation → set localStorage first
  function create(): TokenAuthService {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    return TestBed.inject(TokenAuthService);
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => httpTesting.verify());

  it('keeps the token and reads the user from it after login', async () => {
    const service = create();
    const token = fakeToken(3600);

    const result = firstValueFrom(service.login({ email: 'bob@email.bob', password: 'x' }));
    httpTesting.expectOne(`${environment.authUrl}/token/login`).flush({ token, user: bob });

    expect((await result).name).toBe('Bob Martin');
    expect(service.token()).toBe(token);
    expect(localStorage.getItem('token')).toBe(token); // survives a refresh
    expect(service.currentUser()).toEqual({
      id: 1,
      name: 'Bob Martin',
      email: 'bob@email.bob',
      role: 'admin',
    });
  });

  it('is still logged in after a refresh (token in localStorage)', () => {
    localStorage.setItem('token', fakeToken(3600));

    expect(create().currentUser()?.name).toBe('Bob Martin');
  });

  it('throws away an expired token on start', () => {
    localStorage.setItem('token', fakeToken(-10));

    expect(create().currentUser()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('logout() forgets the token', () => {
    localStorage.setItem('token', fakeToken(3600));
    const service = create();

    service.logout();

    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('decodes the payload and knows when it expires', () => {
    const payload = decodeToken(fakeToken(60));
    expect(payload?.email).toBe('bob@email.bob');
    expect(isExpired(payload)).toBe(false);
    expect(isExpired(decodeToken(fakeToken(-1)))).toBe(true);
    expect(decodeToken('not-a-jwt')).toBeNull();
  });
});
