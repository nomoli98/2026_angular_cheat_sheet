import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GetMeComponent } from './get-me.component';
import { UserController } from '@core/controllers/user.controller';
import { UserResponse } from '@core/responses/user.response';
import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';
import { RoleEnum } from '@core/enums/role.enum';

// The worked example of UNIT_TEST.md ("Step by step: write a test")

const alice: UserResponse = {
  id: 2,
  name: 'Alice Dupont',
  email: 'alice.dupont@mail.com',
  birthdate: '1995-03-14',
  height: 168,
  gender: GenderEnum.FEMALE,
  subscription: SubscriptionEnum.FREE,
  role: RoleEnum.USER,
};

describe('GetMeComponent', () => {
  let fixture: ComponentFixture<GetMeComponent>;
  let html: HTMLElement;

  // A fake controller: only the method the component uses.
  // getMe() returns a Promise → mockResolvedValue (success) / mockRejectedValue (error)
  const fakeController = { getMe: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: UserController, useValue: fakeController }],
    });
    fixture = TestBed.createComponent(GetMeComponent);
    html = fixture.nativeElement;
    await fixture.whenStable();
  });

  const button = () => html.querySelector('button')!;

  it('shows nothing before the click', () => {
    expect(html.querySelector('dl')).toBeNull();
    expect(html.querySelector('.alert-danger')).toBeNull();
  });

  it('shows my account after a click on "Get Me"', async () => {
    fakeController.getMe.mockResolvedValue(alice);

    button().click();
    await fixture.whenStable();

    expect(fakeController.getMe).toHaveBeenCalledTimes(1);
    expect(html.querySelector('dl')?.textContent).toContain('alice.dupont@mail.com');
  });

  it('shows the error when nobody is logged in', async () => {
    fakeController.getMe.mockRejectedValue(new Error('unauthorized'));

    button().click();
    await fixture.whenStable();

    expect(html.querySelector('.alert-danger')?.textContent).toContain('unauthorized');
    expect(html.querySelector('dl')).toBeNull();
  });
});
