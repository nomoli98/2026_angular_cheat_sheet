import { Component, inject, signal } from '@angular/core';
import { UserController } from '@core/controllers/user.controller';
import { UserResponse } from '@core/responses/user.response';
import { GenderEnum } from '@core/enums/gender.enum';
import { SubscriptionEnum } from '@core/enums/subscription.enum';
import { RoleEnum } from '@core/enums/role.enum';

@Component({
  imports: [],
  selector: 'app-get-one',
  templateUrl: './get-one.component.html',
})
export class GetOneComponent {
  protected readonly _userController = inject(UserController);
  protected readonly _user = signal<UserResponse>({
    id: 0,
    name: 'placeholder',
    email: 'placeholder',
    birthdate: 'placeholder',
    height: 0,
    gender: GenderEnum.OTHER,
    subscription: SubscriptionEnum.FREE,
    role: RoleEnum.USER,
  });
  protected readonly _error = signal<string | null>(null);

  async onClick() {
    this._error.set(null);
    try {
      this._user.set(await this._userController.getOne(Math.random()*10));
    } catch (err) {
      // 'unauthorized' (nobody logged in), 'forbidden' (not admin) or an HTTP error
      this._error.set((err as Error).message);
    }
  }
}
