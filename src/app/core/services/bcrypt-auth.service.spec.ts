import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { compare, hashSync } from 'bcryptjs';
import { BcryptAuthService } from './bcrypt-auth.service';
import { UserEntity } from '@core/entities/user.entity';
import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';
import { RoleEnum } from '@core/enums/role.enum';
import { environment } from '@env/environment';

const url = `${environment.apiUrl}/securePeople`;

// Bob as /securePeople stores him: the password is a HASH (cost 4 = fast tests)
const bob: UserEntity = {
  id: 1,
  name: 'Bob Martin',
  email: 'bob@email.bob',
  password: hashSync('BobIsTheBest99#', 4),
  birthdate: '2000-09-22',
  height: 195,
  gender: GenderEnum.MALE,
  subscription: SubscriptionEnum.PREMIUM,
  agreeToTerms: true,
  role: RoleEnum.ADMIN,
};

// bcrypt is async: the service's request comes AFTER hash()/compare() finish
const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));
async function waitForRequest(httpTesting: HttpTestingController, method: string) {
  for (let i = 0; i < 200; i++) {
    const found = httpTesting.match((r) => r.method === method);
    if (found.length) return found[0];
    await nextTick();
  }
  throw new Error(`no ${method} request`);
}

describe('BcryptAuthService', () => {
  let service: BcryptAuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BcryptAuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('logs in when the password matches the hash', async () => {
    const result = firstValueFrom(
      service.login({ email: 'bob@email.bob', password: 'BobIsTheBest99#' }),
    );
    httpTesting
      .expectOne((r) => r.url === url && r.params.get('email') === 'bob@email.bob')
      .flush([bob]);

    const user = await result;
    expect(user.name).toBe('Bob Martin');
    expect(user).not.toHaveProperty('password'); // the hash stays in the service
    expect(service.currentUser()?.name).toBe('Bob Martin');
  });

  it('refuses a wrong password', async () => {
    const result = firstValueFrom(service.login({ email: 'bob@email.bob', password: 'wrong' }));
    httpTesting.expectOne((r) => r.url === url).flush([bob]);

    await expect(result).rejects.toThrow('bad credentials');
    expect(service.currentUser()).toBeNull();
  });

  it('stores a hash, not the password, on register', async () => {
    const { id: _id, role: _role, ...request } = { ...bob, password: 'ZoeIsTheBest99#' };
    const result = firstValueFrom(service.register(request));

    httpTesting.expectOne((r) => r.method === 'GET').flush([]); // email free
    const post = await waitForRequest(httpTesting, 'POST'); // after hash() finished

    const sent = post.request.body as UserEntity;
    expect(sent.password).toMatch(/^\$2[aby]\$10\$/); // bcrypt, cost 10
    expect(sent.password).not.toContain('ZoeIsTheBest99#');
    expect(await compare('ZoeIsTheBest99#', sent.password)).toBe(true);
    post.flush({ ...sent, id: 11 });

    expect((await result).id).toBe(11);
    expect(service.currentUser()?.id).toBe(11);
  });

  it('refuses a taken email and sends nothing', async () => {
    const { id: _id, role: _role, ...request } = bob;
    const result = firstValueFrom(service.register(request));

    httpTesting.expectOne((r) => r.method === 'GET').flush([bob]);

    await expect(result).rejects.toThrow('email already taken');
    httpTesting.expectNone((r) => r.method === 'POST');
  });
});
