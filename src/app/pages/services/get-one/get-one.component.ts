import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, min, required } from '@angular/forms/signals';
import { UserResponse } from '@core/responses/user.response';
import { UserController } from '@core/controllers/user.controller';
import { errorMessage } from '@core/controllers/error-message';
import { AuthService } from '@core/services/auth.service';
import { isAdmin } from '@core/controllers/permissions';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import getOne from './snippets/get-one.md';

@Component({
  imports: [CodeSnippetComponent, FormField],
  selector: 'app-get-one',
  templateUrl: './get-one.component.html',
})
export class GetOneComponent {
  // page snippets
  protected readonly snippets = { getOne };

  protected readonly _userController = inject(UserController);
  protected readonly _user = signal<UserResponse | null>(null); // null = not loaded
  protected readonly _error = signal<string | null>(null);

  // re-computed when the toggle changes the user
  private readonly _authService = inject(AuthService);
  protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));

  // a signal form with just the id
  protected readonly _idForm = form(signal({ id: 2 }), (field) => {
    required(field.id, { message: 'Id is required' });
    min(field.id, 1, { message: 'Id starts at 1' });
  });

  async onSubmit(event: Event) {
    event.preventDefault(); // no page reload
    if (this._idForm().invalid()) return;

    this._error.set(null);
    this._user.set(null);
    // 1. not admin → skip the controller
    if (!this._isAdmin()) {
      this._error.set('forbidden: only an admin can read a user');
      return;
    }

    try {
      // 2. the controller checks again
      this._user.set(await this._userController.getOne(this._idForm.id().value()));
    } catch (err) {
      // 'unauthorized', 'forbidden' or 404
      this._error.set(errorMessage(err));
    }
  }
}
