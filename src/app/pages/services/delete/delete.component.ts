import { Component, inject, signal } from '@angular/core';
import { form, FormField, min, required } from '@angular/forms/signals';
import { UserController } from '@core/controllers/user.controller';
import { errorMessage } from '@core/controllers/error-message';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import deleteSnippet from './snippets/delete.md';

@Component({
  imports: [CodeSnippetComponent, FormField],
  selector: 'app-delete',
  templateUrl: './delete.component.html',
})
export class DeleteComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { delete: deleteSnippet };

  protected readonly _userController = inject(UserController);
  protected readonly _confirming = signal(false); // first click asks, second click deletes
  protected readonly _deletedId = signal<number | null>(null);
  protected readonly _error = signal<string | null>(null);

  protected readonly _idForm = form(signal({ id: 2 }), (field) => {
    required(field.id, { message: 'Id is required' });
    min(field.id, 1, { message: 'Id starts at 1' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (this._idForm().invalid()) return;
    this._error.set(null);
    this._deletedId.set(null);
    this._confirming.set(true);
  }

  async onConfirm() {
    const id = this._idForm.id().value();
    this._confirming.set(false);
    try {
      await this._userController.delete(id); // Promise<void>: nothing to read, just wait
      this._deletedId.set(id);
    } catch (err) {
      // 'unauthorized', 'forbidden' (not admin AND not you), 'user not found' or an HTTP error
      this._error.set(errorMessage(err));
    }
  }
}
