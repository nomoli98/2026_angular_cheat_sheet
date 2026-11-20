import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, min, required } from '@angular/forms/signals';
import { UserController } from '@core/controllers/user.controller';
import { errorMessage } from '@core/controllers/error-message';
import { AuthService } from '@core/services/auth.service';
import { isAdmin } from '@core/controllers/permissions';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import deleteSnippet from './snippets/delete.md';

@Component({
  imports: [CodeSnippetComponent, FormField],
  selector: 'app-delete',
  templateUrl: './delete.component.html',
})
export class DeleteComponent {
  // page snippets
  protected readonly snippets = { delete: deleteSnippet };

  protected readonly _userController = inject(UserController);
  protected readonly _confirming = signal(false); // 1st click asks, 2nd deletes
  protected readonly _deletedId = signal<number | null>(null);
  protected readonly _error = signal<string | null>(null);

  // re-computed when the toggle changes the user
  private readonly _authService = inject(AuthService);
  protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));

  protected readonly _idForm = form(signal({ id: 2 }), (field) => {
    required(field.id, { message: 'Id is required' });
    min(field.id, 1, { message: 'Id starts at 1' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (this._idForm().invalid()) return;
    this._error.set(null);
    this._deletedId.set(null);
    // 1. not admin → skip the controller
    if (!this._isAdmin()) {
      this._error.set('forbidden: only an admin can delete a user');
      return;
    }
    this._confirming.set(true);
  }

  async onConfirm() {
    const id = this._idForm.id().value();
    this._confirming.set(false);
    // check again: the toggle may have changed
    if (!this._isAdmin()) {
      this._error.set('forbidden: only an admin can delete a user');
      return;
    }
    try {
      await this._userController.delete(id); // Promise<void>
      this._deletedId.set(id);
    } catch (err) {
      // 'unauthorized', 'forbidden', 'user not found' or HTTP error
      this._error.set(errorMessage(err));
    }
  }
}
