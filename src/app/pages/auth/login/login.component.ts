import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { LoginRequest } from '@core/requests/login.request';
import { AuthController } from '@core/controllers/auth.controller';
import { AuthService } from '@core/services/auth.service';
import { errorMessage } from '@core/controllers/error-message';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import login from './snippets/login.md';

// demo accounts (db.seed.json)
const ACCOUNTS = {
    bob: { email: 'bob@email.bob', password: 'BobIsTheBest99#' }, // admin
    alice: { email: 'alice.dupont@mail.com', password: 'AliceIsTheBest99#' }, // user
};

@Component({
    imports: [CodeSnippetComponent, FormField],
    selector: 'app-login',
    templateUrl: './login.component.html',
})
export class LoginComponent {
    // page snippets
    protected readonly snippets = { login };

    protected readonly _authController = inject(AuthController);
    // read-only: who is logged in
    protected readonly _currentUser = inject(AuthService).currentUser;
    protected readonly _error = signal<string | null>(null);
    protected readonly _busy = signal(false);

    protected readonly _model = signal<LoginRequest>({ email: '', password: '' });
    // login: only 'required', the API checks the password
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
            // 'bad credentials' → 'Wrong email or password'
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
            this._error.set(errorMessage(err)); // nobody logged in
        }
    }
}
