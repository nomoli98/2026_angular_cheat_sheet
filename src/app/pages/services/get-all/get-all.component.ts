import { Component, inject, signal } from '@angular/core';
import { UserResponse } from '@core/responses/user.response';
import { UserController } from '@core/controllers/user.controller';

@Component({
  imports: [],
  selector: 'app-get-all',
  templateUrl: './get-all.component.html',
})
export class GetAllComponent {
  protected readonly _userController = inject(UserController);
  protected readonly _users = signal<UserResponse[]>([]);

  async onClick() {
    this._users.set(await this._userController.getAll());
  }
}
