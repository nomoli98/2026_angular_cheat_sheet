import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { UserEntity } from '@core/entities/user.entity';
import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';
import { environment } from '@env/environment';

const url = `${environment.apiUrl}/people`;

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

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  // The "does the user exist?" request: GET /people?id=...
  const existsRequest = (id: number) =>
    httpTesting.expectOne(
      (r) => r.method === 'GET' && r.url === url && r.params.get('id') === `${id}`,
    );

  describe('exists / emailExists', () => {
    it('exists() is true when json-server finds the id', async () => {
      const result = firstValueFrom(service.exists(1));
      existsRequest(1).flush([bob]);

      expect(await result).toBe(true);
    });

    it('exists() is false when json-server finds nobody', async () => {
      const result = firstValueFrom(service.exists(999));
      existsRequest(999).flush([]);

      expect(await result).toBe(false);
    });

    it('emailExists() asks GET /people?email=...', async () => {
      const result = firstValueFrom(service.emailExists('bob@email.bob'));
      httpTesting
        .expectOne((r) => r.url === url && r.params.get('email') === 'bob@email.bob')
        .flush([bob]);

      expect(await result).toBe(true);
    });
  });

  describe('delete', () => {
    it('deletes when the user exists', async () => {
      const result = firstValueFrom(service.delete(1), { defaultValue: undefined });

      existsRequest(1).flush([bob]); // 1. the check
      const req = httpTesting.expectOne(`${url}/1`); // 2. the real DELETE
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      await result;
    });

    it('errors and sends NO delete when the user does not exist', async () => {
      const result = firstValueFrom(service.delete(999));

      existsRequest(999).flush([]);
      httpTesting.expectNone(`${url}/999`); // the DELETE was never sent

      await expect(result).rejects.toThrow('user not found');
    });
  });

  describe('update', () => {
    it('patches when the user exists', async () => {
      const result = firstValueFrom(service.updatePartial(1, { height: 200 }));

      existsRequest(1).flush([bob]);
      const req = httpTesting.expectOne(`${url}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ height: 200 });
      req.flush({ ...bob, height: 200 });

      const user = await result;
      expect(user.height).toBe(200);
      expect('password' in user).toBe(false);
    });

    it('errors and sends NO put when the user does not exist', async () => {
      const { id: _id, ...request } = bob;
      const result = firstValueFrom(service.updateFully(999, request));

      existsRequest(999).flush([]);
      httpTesting.expectNone(`${url}/999`);

      await expect(result).rejects.toThrow('user not found');
    });
  });
});
