import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { email, form, FormField, max, min, required, validate } from '@angular/forms/signals';
import { UserResponse } from '@core/responses/user.response';
import { RegisterRequest } from '@core/requests/register.request';
import { BcryptAuthController } from '@core/controllers/bcrypt-auth.controller';
import { errorMessage } from '@core/controllers/error-message';
import { GenderEnum } from '@core/enums/gender.enum';
import { strongPassword } from '@core/validators/signal-form/strong-password.validator';
import { birthdate } from '@core/validators/signal-form/birthdate.validator';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import register from './snippets/register.md';

const EMPTY: RegisterRequest = {
  name: '',
  email: '',
  password: '',
  birthdate: '',
  height: 170,
  gender: GenderEnum.OTHER,
  subscription: 'free',
  agreeToTerms: false,
};

@Component({
  imports: [CodeSnippetComponent, FormField, RouterLink],
  selector: 'app-bcrypt-register',
  templateUrl: './register.component.html',
})
export class BcryptRegisterComponent {
  // page snippets
  protected readonly snippets = { register };

  protected readonly GenderEnum = GenderEnum;
  protected readonly _authController = inject(BcryptAuthController);
  protected readonly _created = signal<UserResponse | null>(null);
  protected readonly _error = signal<string | null>(null);
  protected readonly _busy = signal(false); // waiting for the API

  protected readonly _model = signal<RegisterRequest>({ ...EMPTY });

  protected readonly _form = form(this._model, (field) => {
    required(field.name, { message: 'Name is required' });
    required(field.email, { message: 'Email is required' });
    email(field.email, { message: 'Email must be a valid email' });
    required(field.password, { message: 'Password is required' });
    strongPassword(field.password);
    required(field.birthdate, { message: 'Birthdate is required' });
    birthdate(field.birthdate, { minAge: 18, maxAge: 120 });
    min(field.height, 50, { message: 'Height must be above 50cm' });
    max(field.height, 275, { message: 'Height must be below 275cm' });
    validate(field.agreeToTerms, ({ value }) =>
      value() ? undefined : { kind: 'agreeToTerms', message: 'You must agree to the terms' },
    );
  });

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this._form().invalid()) return;

    this._error.set(null);
    this._created.set(null);
    this._busy.set(true);
    try {
      // hashes, creates (role: user), logs in
      this._created.set(await this._authController.register(this._form().value()));
      this._model.set({ ...EMPTY });
      this._form().reset(); // untouched: no red fields
    } catch (err) {
      // 'email already taken' or an HTTP error
      this._error.set(errorMessage(err));
    } finally {
      this._busy.set(false);
    }
  }
}
