import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserController } from './user.controller';
import { UserService } from '@core/services/user.service';
import { UserResponse } from '@core/responses/user.response';
import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';

const bob: UserResponse = {
  id: 1,
  name: 'Bob Martin',
  email: 'bob@email.bob',
  birthdate: '2000-09-22',
  height: 195,
  gender: GenderEnum.MALE,
  subscription: SubscriptionEnum.PREMIUM,
};
const alice: UserResponse = { ...bob, id: 2, name: 'Alice Dupont', email: 'alice@mail.com' };

describe('UserController', () => {
  let controller: UserController;

  // Fake UserService: answers right away with of(...) / throwError(...)
  const fakeUserService = {
    getAll: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    updateFully: vi.fn(),
    updatePartial: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: UserService, useValue: fakeUserService }],
    });
    controller = TestBed.inject(UserController);

    // start every test with Bob and Alice in the list
    fakeUserService.getAll.mockReturnValue(of([bob, alice]));
    controller.loadAll();
  });

  it('loadAll() fills the users signal', () => {
    expect(controller.users()).toEqual([bob, alice]);
    expect(controller.count()).toBe(2);
    expect(controller.loading()).toBe(false);
  });

  it('loadOne() fills selected', () => {
    fakeUserService.getOne.mockReturnValue(of(alice));

    controller.loadOne(2);

    expect(controller.selected()).toEqual(alice);
  });

  it('create() adds the new user to the list', () => {
    const charlie = { ...bob, id: 3, name: 'Charlie' };
    fakeUserService.create.mockReturnValue(of(charlie));

    controller.create({ ...charlie, password: 'x', agreeToTerms: true });

    expect(controller.users().map((u) => u.name)).toEqual([
      'Bob Martin',
      'Alice Dupont',
      'Charlie',
    ]);
  });

  it('updatePartial() replaces the user in the list', () => {
    fakeUserService.updatePartial.mockReturnValue(of({ ...bob, height: 200 }));

    controller.updatePartial(1, { height: 200 });

    expect(controller.users()[0].height).toBe(200);
    expect(controller.count()).toBe(2);
  });

  it('delete() removes the user from the list and calls onSuccess', () => {
    fakeUserService.delete.mockReturnValue(of(undefined));
    const onSuccess = vi.fn();

    controller.delete(1, onSuccess);

    expect(controller.users()).toEqual([alice]);
    expect(onSuccess).toHaveBeenCalled();
  });

  it('keeps the list and shows an error when the user does not exist', () => {
    fakeUserService.delete.mockReturnValue(throwError(() => new Error('user not found')));

    controller.delete(999);

    expect(controller.users()).toEqual([bob, alice]); // unchanged
    expect(controller.error()).toBe('This user does not exist');
  });
});
