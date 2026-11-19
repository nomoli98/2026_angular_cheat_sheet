```ts auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { UserEntity } from '@core/entities/user.entity';
import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';
import { environment } from '@env/environment';

const url = `${environment.apiUrl}/people`;

// What the fake API would send back for Bob
const bob: UserEntity = {
  id: 1,
  name: 'Bob Martin',
  email: 'bob@email.bob',
  password: 'BobIsTheBest99#',
  birthdate: '2000-09-22',
  height: 195,
  gender: GenderEnum.MALE,
  subscription: SubscriptionEnum.PREMIUM,
  agreeToTerms: true,
};

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()], // fake backend
    });
    service = TestBed.inject(AuthService); // like inject(AuthService) in a component
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify(); // no request left unanswered
  });

  it('logs in with the right email and password', async () => {
    const result = firstValueFrom(
      service.login({ email: 'bob@email.bob', password: 'BobIsTheBest99#' }),
    );

    // The service asked GET /people?email=bob@email.bob → we answer [bob]
    const req = httpTesting.expectOne(
      (r) => r.url === url && r.params.get('email') === 'bob@email.bob',
    );
    req.flush([bob]);

    const user = await result;
    expect(user.name).toBe('Bob Martin');
    expect('password' in user).toBe(false); // the mapper removed it
    expect(service.currentUser()?.name).toBe('Bob Martin');
  });

  it('refuses a wrong password', async () => {
    const result = firstValueFrom(service.login({ email: 'bob@email.bob', password: 'wrong' }));

    httpTesting.expectOne((r) => r.url === url).flush([bob]);

    await expect(result).rejects.toThrow('bad credentials');
    expect(service.currentUser()).toBeNull();
  });

  it('refuses an unknown email', async () => {
    const result = firstValueFrom(service.login({ email: 'nobody@mail.com', password: 'x' }));

    httpTesting.expectOne((r) => r.url === url).flush([]); // json-server found nobody

    await expect(result).rejects.toThrow('bad credentials');
  });

  it('logs out', async () => {
    const result = firstValueFrom(
      service.login({ email: 'bob@email.bob', password: 'BobIsTheBest99#' }),
    );
    httpTesting.expectOne((r) => r.url === url).flush([bob]);
    await result;

    service.logout();

    expect(service.currentUser()).toBeNull();
  });
});
```

```ts auth.service.ts
import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { UserService } from '@core/services/user.service';
import { UserMapper } from '@core/mapper/user.mapper';
import { UserEntity } from '@core/entities/user.entity';
import { UserResponse } from '@core/responses/user.response';
import { RegisterRequest } from '@core/requests/register.request';
import { LoginRequest } from '@core/requests/login.request';

@Service()
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _url = `${environment.apiUrl}/people`;
  private readonly _userService = inject(UserService);

  // The logged-in user, or null. Only the service can change it (asReadonly).
  private readonly _currentUser = signal<UserResponse | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  register(request: RegisterRequest): Observable<UserResponse> {
    return this._userService.create(request);
  }

  // Fake login: GET /people?email=... → [user] or [], then the password is checked HERE.
  login(request: LoginRequest): Observable<UserResponse> {
    return this._http.get<UserEntity[]>(this._url, { params: { email: request.email } }).pipe(
      map((users) => {
        const user = users[0];
        if (!user || user.password !== request.password) throw new Error('bad credentials');
        return UserMapper(user);
      }),
      tap((user) => this._currentUser.set(user)), // remember who is logged in
    );
  }

  logout(): void {
    this._currentUser.set(null);
  }
}
```
