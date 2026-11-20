import { Component, computed, inject, signal } from '@angular/core';
import { email, form, FormField, max, min, required, validate } from '@angular/forms/signals';
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
import updateFully from './snippets/update-fully.md';

// id + every RegisterRequest field
type UpdateFullyModel = { id: number } & RegisterRequest;

@Component({
  imports: [CodeSnippetComponent, FormField],
  selector: 'app-update-fully',
  templateUrl: './update-fully.component.html',
})
export class UpdateFullyComponent {
  // page snippets
  protected readonly snippets = { updateFully };

  protected readonly GenderEnum = GenderEnum;
  protected readonly _userController = inject(UserController);
  protected readonly _updated = signal<UserResponse | null>(null);
  protected readonly _error = signal<string | null>(null);

  // re-computed when the toggle changes the user
  private readonly _authService = inject(AuthService);
  protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));

  protected readonly _model = signal<UpdateFullyModel>({
    id: 2,
    name: '',
    email: '',
    password: '',
    birthdate: '',
    height: 170,
    gender: GenderEnum.OTHER,
    subscription: 'free',
    agreeToTerms: true,
  });

  // PUT replaces everything: all required
  protected readonly _form = form(this._model, (field) => {
    required(field.id, { message: 'Id is required' });
    min(field.id, 1, { message: 'Id starts at 1' });

    required(field.name, { message: 'Name is required' });
    required(field.email, { message: 'Email is required' });
    email(field.email, { message: 'Email must be a valid email' });
    required(field.password, { message: 'Password is required' });
    strongPassword(field.password);
    required(field.birthdate, { message: 'Birthdate is required' });
    birthdate(field.birthdate, { minAge: 18, maxAge: 120 });
    min(field.height, 50, { message: 'Height must be above 50cm' });
    max(field.height, 275, { message: 'Height must be below 275cm' });
    required(field.gender, { message: 'Gender is required' });
    required(field.subscription, { message: 'Subscription is required' });
    validate(field.agreeToTerms, ({ value }) =>
      value() ? undefined : { kind: 'agreeToTerms', message: 'You must agree to the terms' },
    );
  });

  // fill the form (the password is never sent back)
  async onLoad() {
    this._error.set(null);
    // 1. not admin → skip the controller
    if (!this._isAdmin()) {
      this._error.set('forbidden: only an admin can read a user');
      return;
    }
    try {
      const { id, name, email, birthdate, height, gender, subscription } =
        await this._userController.getOne(this._form.id().value());
      this._model.set({
        id,
        name,
        email,
        birthdate,
        height,
        gender,
        subscription,
        password: '',
        agreeToTerms: true,
      });
    } catch (err) {
      this._error.set(errorMessage(err));
    }
  }

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
    // split the id from the body
    const { id, ...request } = this._form().value();
    try {
      // 2. the controller checks again
      this._updated.set(await this._userController.updateFully(id, request));
    } catch (err) {
      // 'unauthorized', 'forbidden', 'user not found' or HTTP error
      this._error.set(errorMessage(err));
    }
  }
}
