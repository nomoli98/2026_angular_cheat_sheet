import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { email, form, FormField, required } from '@angular/forms/signals';
import { LoginRequest } from '@core/requests/login.request';
import { TokenAuthController } from '@core/controllers/token-auth.controller';
import { TokenAuthService } from '@core/services/token-auth.service';
import { errorMessage } from '@core/controllers/error-message';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import login from './snippets/login.md';

// Demo accounts from fake-api/db.seed.json (same passwords, stored as hashes in securePeople)
const ACCOUNTS = {
  bob: { email: 'bob@email.bob', password: 'BobIsTheBest99#' }, // admin
  alice: { email: 'alice.dupont@mail.com', password: 'AliceIsTheBest99#' }, // user
};

@Component({
  imports: [CodeSnippetComponent, FormField, RouterLink],
  selector: 'app-token-login',
  templateUrl: './login.component.html',
})
export class TokenLoginComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { login };

  protected readonly _authController = inject(TokenAuthController);
  // read-only: WHO is logged in, read from the token (the controller does the login/logout)
  protected readonly _currentUser = inject(TokenAuthService).currentUser;
  protected readonly _error = signal<string | null>(null);
  protected readonly _busy = signal(false);

  protected readonly _model = signal<LoginRequest>({ email: '', password: '' });
  // no strongPassword() here: on login we only check it's filled, the API says if it's right
  protected readonly _form = form(this._model, (field) => {
    required(field.email, { message: 'Email is required' });
    email(field.email, { message: 'Email must be a valid email' });
    required(field.password, { message: 'Password is required' });
  });

  fill(account: keyof typeof ACCOUNTS) {
    this._model.set({ ...ACCOUNTS[account] });
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this._form().invalid()) return;

    this._error.set(null);
    this._busy.set(true);
    try {
      await this._authController.login(this._form().value()); // fills currentUser
      this._model.set({ email: '', password: '' });
      this._form().reset();
    } catch (err) {
      // 'bad credentials' → 'Wrong email or password', or 'The server is not reachable...'
      this._error.set(errorMessage(err));
    } finally {
      this._busy.set(false);
    }
  }

  async onLogout() {
    this._error.set(null);
    try {
      await this._authController.logout(); // empties currentUser
    } catch (err) {
      this._error.set(errorMessage(err)); // 'unauthorized': nobody was logged in
    }
  }
}
