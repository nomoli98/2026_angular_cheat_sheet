import { Component, inject, signal } from '@angular/core';
import { UserResponse } from '@core/responses/user.response';
import { UserController } from '@core/controllers/user.controller';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import getAll from './snippets/get-all.md';

@Component({
  imports: [CodeSnippetComponent],
  selector: 'app-get-all',
  templateUrl: './get-all.component.html',
})
export class GetAllComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { getAll };

  protected readonly _userController = inject(UserController);
  protected readonly _users = signal<UserResponse[]>([]);
  protected readonly _error = signal<string | null>(null);

  async onClick() {
    this._error.set(null);
    try {
      this._users.set(await this._userController.getAll());
    } catch (err) {
      // 'unauthorized' (nobody logged in), 'forbidden' (not admin) or an HTTP error
      this._error.set((err as Error).message);
    }
  }
}
