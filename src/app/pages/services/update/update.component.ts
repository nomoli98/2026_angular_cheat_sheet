import { Component, computed, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { applyWhen, email, form, FormField, max, min, required } from '@angular/forms/signals';
import { UserResponse } from '@core/responses/user.response';
import { RegisterRequest } from '@core/requests/register.request';
import { UserController } from '@core/controllers/user.controller';
import { errorMessage } from '@core/controllers/error-message';
import { GenderEnum } from '@core/enums/gender.enum';
import { strongPassword } from '@core/validators/signal-form/strong-password.validator';
import { birthdate } from '@core/validators/signal-form/birthdate.validator';
import { AuthService } from '@core/services/auth.service';
import { isAdmin } from '@core/controllers/permissions';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import update from './snippets/update.md';

// empty ('' or null) = don't change it
interface UpdateModel {
  id: number;
  name: string;
  email: string;
  password: string;
  birthdate: string;
  height: number | null; // empty number input = null
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
  // page snippets
  protected readonly snippets = { update };

  protected readonly GenderEnum = GenderEnum;
  protected readonly _userController = inject(UserController);
  protected readonly _sent = signal<Partial<RegisterRequest> | null>(null); // PATCH body
  protected readonly _updated = signal<UserResponse | null>(null);
  protected readonly _error = signal<string | null>(null);

  // re-computed when the toggle changes the user
  private readonly _authService = inject(AuthService);
  protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));

  protected readonly _model = signal<UpdateModel>({ ...EMPTY });

  // only id required, other rules apply when filled
  protected readonly _form = form(this._model, (field) => {
    required(field.id, { message: 'Id is required' });
    min(field.id, 1, { message: 'Id starts at 1' });

    email(field.email, { message: 'Email must be a valid email' }); // '' is OK
    // strongPassword() only when something is typed
    applyWhen(
      field.password,
      ({ value }) => value() !== '',
      (password) => strongPassword(password),
    );
    birthdate(field.birthdate, { minAge: 18, maxAge: 120 }); // skips ''
    min(field.height, 50, { message: 'Height must be above 50cm' }); // skips null
    max(field.height, 275, { message: 'Height must be below 275cm' });
  });

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this._form().invalid()) return;

    this._error.set(null);
    this._updated.set(null);
    // 1. not admin → skip the controller
    if (!this._isAdmin()) {
      this._error.set('forbidden: only an admin can update a user');
      return;
    }

    const { id, ...fields } = this._form().value();
    // keep the filled fields
    const changes = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== '' && value !== null),
    ) as Partial<RegisterRequest>;

    if (Object.keys(changes).length === 0) {
      this._error.set('Fill in at least one field to change');
      return;
    }

    this._sent.set(changes);
    try {
      // 2. the controller checks again
      this._updated.set(await this._userController.updatePartial(id, changes));
      this._model.set({ ...EMPTY, id }); // clear, keep the id
    } catch (err) {
      // 'unauthorized', 'forbidden', 'user not found' or HTTP error
      this._error.set(errorMessage(err));
    }
  }
}
