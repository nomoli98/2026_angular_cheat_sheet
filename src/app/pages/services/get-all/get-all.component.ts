import { Component, computed, inject, signal } from '@angular/core';
import { UserResponse } from '@core/responses/user.response';
import { UserController } from '@core/controllers/user.controller';
import { AuthService } from '@core/services/auth.service';
import { isAdmin } from '@core/controllers/permissions';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import getAll from './snippets/get-all.md';

@Component({
    imports: [CodeSnippetComponent],
    selector: 'app-get-all',
    templateUrl: './get-all.component.html',
})
export class GetAllComponent {
    // page snippets
    protected readonly snippets = { getAll };

    protected readonly _userController = inject(UserController);
    protected readonly _users = signal<UserResponse[]>([]);
    protected readonly _error = signal<string | null>(null);

    // re-computed when the toggle changes the user
    private readonly _authService = inject(AuthService);
    protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));

    async onClick() {
        this._error.set(null);
        // 1. not admin → skip the controller
        if (!this._isAdmin()) {
            this._error.set('forbidden: only an admin can see the list of users');
            return;
        }

        try {
            // 2. the controller checks again
            this._users.set(await this._userController.getAll());
        } catch (err) {
            // 'unauthorized', 'forbidden' or HTTP error
            this._error.set((err as Error).message);
        }
    }
}
