import { Component, inject, signal } from '@angular/core';
import { form, FormField, min, required } from '@angular/forms/signals';
import { UserResponse } from '@core/responses/user.response';
import { UserController } from '@core/controllers/user.controller';
import { errorMessage } from '@core/controllers/error-message';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import getOne from './snippets/get-one.md';

@Component({
  imports: [CodeSnippetComponent, FormField],
  selector: 'app-get-one',
  templateUrl: './get-one.component.html',
})
export class GetOneComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { getOne };

  protected readonly _userController = inject(UserController);
  protected readonly _user = signal<UserResponse | null>(null); // null = nothing loaded yet
  protected readonly _error = signal<string | null>(null);

  // Which user? A tiny signal form with just the id
  protected readonly _idForm = form(signal({ id: 2 }), (field) => {
    required(field.id, { message: 'Id is required' });
    min(field.id, 1, { message: 'Id starts at 1' });
  });

  async onSubmit(event: Event) {
    event.preventDefault(); // no page reload
    if (this._idForm().invalid()) return;

    this._error.set(null);
    this._user.set(null);
    try {
      this._user.set(await this._userController.getOne(this._idForm.id().value()));
    } catch (err) {
      // 'unauthorized', 'forbidden' (not admin AND not you), or 404 → 'Not found'
      this._error.set(errorMessage(err));
    }
  }
}
