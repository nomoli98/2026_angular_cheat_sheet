import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { applyWhen, email, form, FormField, max, min, required } from '@angular/forms/signals';
import { UserResponse } from '@core/responses/user.response';
import { RegisterRequest } from '@core/requests/register.request';
import { UserController } from '@core/controllers/user.controller';
import { errorMessage } from '@core/controllers/error-message';
import { GenderEnum } from '@core/enums/gender.enum';
import { strongPassword } from '@core/validators/signal-form/strong-password.validator';
import { birthdate } from '@core/validators/signal-form/birthdate.validator';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import update from './snippets/update.md';

// Every field can be EMPTY ('' or null) = "don't change it"
interface UpdateModel {
  id: number;
  name: string;
  email: string;
  password: string;
  birthdate: string;
  height: number | null; // an empty <input type="number"> gives null
  gender: GenderEnum | '';
  subscription: 'free' | 'premium' | '';
}

const EMPTY: UpdateModel = {
  id: 2,
  name: '',
  email: '',
  password: '',
  birthdate: '',
  height: null,
  gender: '',
  subscription: '',
};

@Component({
  imports: [CodeSnippetComponent, FormField, JsonPipe],
  selector: 'app-update',
  templateUrl: './update.component.html',
})
export class UpdateComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { update };

  protected readonly GenderEnum = GenderEnum;
  protected readonly _userController = inject(UserController);
  protected readonly _sent = signal<Partial<RegisterRequest> | null>(null); // the PATCH body
  protected readonly _updated = signal<UserResponse | null>(null);
  protected readonly _error = signal<string | null>(null);

  protected readonly _model = signal<UpdateModel>({ ...EMPTY });

  // Only the id is required. The other rules only matter when the field is filled in.
  protected readonly _form = form(this._model, (field) => {
    required(field.id, { message: 'Id is required' });
    min(field.id, 1, { message: 'Id starts at 1' });

    email(field.email, { message: 'Email must be a valid email' }); // '' is OK for email()
    // strongPassword() would complain about '' → only apply it when something is typed
    applyWhen(
      field.password,
      ({ value }) => value() !== '',
      (password) => strongPassword(password),
    );
    birthdate(field.birthdate, { minAge: 18, maxAge: 120 }); // already skips ''
    min(field.height, 50, { message: 'Height must be above 50cm' }); // min/max skip null
    max(field.height, 275, { message: 'Height must be below 275cm' });
  });

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this._form().invalid()) return;

    this._error.set(null);
    this._updated.set(null);

    const { id, ...fields } = this._form().value();
    // Keep only the fields that were filled in
    const changes = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== '' && value !== null),
    ) as Partial<RegisterRequest>;

    if (Object.keys(changes).length === 0) {
      this._error.set('Fill in at least one field to change');
      return;
    }

    this._sent.set(changes);
    try {
      this._updated.set(await this._userController.updatePartial(id, changes));
      this._model.set({ ...EMPTY, id }); // clear the fields, keep the id
    } catch (err) {
      // 'unauthorized', 'forbidden' (not admin AND not you), 'user not found' or an HTTP error
      this._error.set(errorMessage(err));
    }
  }
}
