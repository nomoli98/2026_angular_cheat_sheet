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
