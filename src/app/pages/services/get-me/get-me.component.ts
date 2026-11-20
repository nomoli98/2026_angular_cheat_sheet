import { Component, inject, signal } from '@angular/core';
import { UserResponse } from '@core/responses/user.response';
import { UserController } from '@core/controllers/user.controller';
import { errorMessage } from '@core/controllers/error-message';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import getMe from './snippets/get-me.md';

@Component({
  imports: [CodeSnippetComponent],
  selector: 'app-get-me',
  templateUrl: './get-me.component.html',
})
export class GetMeComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { getMe };

  protected readonly _userController = inject(UserController);
  protected readonly _me = signal<UserResponse | null>(null);
  protected readonly _error = signal<string | null>(null);

  async onClick() {
    this._error.set(null);
    try {
      this._me.set(await this._userController.getMe());
    } catch (err) {
      // only 'unauthorized' (nobody logged in) or an HTTP error: everybody may read themselves
      this._error.set(errorMessage(err));
    }
  }
}
