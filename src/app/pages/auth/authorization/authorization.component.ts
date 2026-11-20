import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { TokenAuthService } from '@core/services/token-auth.service';
import { UserController } from '@core/controllers/user.controller';
import { TokenAuthController } from '@core/controllers/token-auth.controller';
import { isAdmin } from '@core/controllers/permissions';
import { errorMessage } from '@core/controllers/error-message';
import { UserResponse } from '@core/responses/user.response';
import { RoleEnum } from '@core/enums/role.enum';
import { AuthToggleService } from '@shared/auth-toggle/auth-toggle.service';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import roles from './snippets/roles.md';
import controller from './snippets/controller.md';
import component from './snippets/component.md';
import guard from './snippets/guard.md';
import server from './snippets/server.md';

type Who = UserResponse | null;

// One line of the "who can do what" table
interface Rule {
  method: string;
  who: string;
  allowed: (user: Who) => boolean;
}

// same rules as UserController
const RULES: Rule[] = [
  { method: 'getAll()', who: 'admin', allowed: isAdmin },
  { method: 'getOne(id)', who: 'admin', allowed: isAdmin },
  { method: 'getMe()', who: 'anybody logged in', allowed: (user) => user !== null },
  { method: 'create(request)', who: 'admin', allowed: isAdmin },
  { method: 'updateFully(id, request)', who: 'admin', allowed: isAdmin },
  { method: 'updatePartial(id, changes)', who: 'admin', allowed: isAdmin },
  { method: 'delete(id)', who: 'admin', allowed: isAdmin },
];

interface CallResult {
  label: string;
  ok: boolean;
  text: string;
}

const TOKEN_ACCOUNTS = {
  bob: { email: 'bob@email.bob', password: 'BobIsTheBest99#' }, // admin
  alice: { email: 'alice.dupont@mail.com', password: 'AliceIsTheBest99#' }, // user
};

@Component({
  imports: [CodeSnippetComponent, RouterLink],
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
})
export class AuthorizationComponent {
  // page snippets
  protected readonly snippets = { roles, controller, component, guard, server };
  protected readonly RoleEnum = RoleEnum;

  private readonly _auth = inject(AuthService);
  private readonly _userController = inject(UserController);
  private readonly _tokenController = inject(TokenAuthController);
  protected readonly _tokenAuth = inject(TokenAuthService);
  protected readonly toggle = inject(AuthToggleService);

  // ?forbidden=... set by adminGuard
  readonly forbidden = input<string>();

  // ---------- 1. who am I, and what may I do?
  protected readonly _user = this._auth.currentUser;
  protected readonly _isAdmin = computed(() => isAdmin(this._user()));
  protected readonly _rules = computed(() =>
    RULES.map((rule) => {
      const user = this._user();
      const allowed = rule.allowed(user);
      // what deny() would throw
      return { ...rule, allowed, error: allowed ? '' : user ? 'forbidden' : 'unauthorized' };
    }),
  );

  // ---------- 2. controller only (no component check)
  protected readonly _calls = signal<CallResult[]>([]);

  async tryController(method: 'getAll' | 'getOne' | 'getMe') {
    const label = method === 'getOne' ? 'getOne(1)' : `${method}()`;
    try {
      const result =
        method === 'getAll'
          ? await this._userController.getAll()
          : method === 'getOne'
            ? [await this._userController.getOne(1)]
            : [await this._userController.getMe()];
      this._addCall(this._calls, { label, ok: true, text: result.map((u) => u.name).join(', ') });
    } catch (err) {
      this._addCall(this._calls, { label, ok: false, text: errorMessage(err) });
    }
  }

  // ---------- 4. the server checks the role (token version)
  protected readonly _tokenUser = this._tokenAuth.currentUser;
  protected readonly _serverCalls = signal<CallResult[]>([]);
  protected readonly _serverError = signal<string | null>(null);

  async tokenLogin(who: keyof typeof TOKEN_ACCOUNTS) {
    this._serverError.set(null);
    try {
      await this._tokenController.login(TOKEN_ACCOUNTS[who]);
    } catch (err) {
      this._serverError.set(errorMessage(err));
    }
  }

  async tokenLogout() {
    this._serverError.set(null);
    this._tokenAuth.logout();
  }

  // skipFrontCheck: ask the server anyway
  async callServer(skipFrontCheck: boolean) {
    const label = skipFrontCheck ? 'GET /token/users (front check skipped)' : 'GET /token/users';
    try {
      const users = await this._tokenController.getUsers(skipFrontCheck);
      this._addCall(this._serverCalls, {
        label,
        ok: true,
        text: `200 OK: ${users.map((u) => u.name).join(', ')}`,
      });
    } catch (err) {
      // HttpErrorResponse = the server said no, Error = Angular did
      const text =
        err instanceof HttpErrorResponse && err.status !== 0
          ? `${err.status} from the server: ${errorMessage(err)}`
          : `stopped in Angular, nothing sent: ${errorMessage(err)}`;
      this._addCall(this._serverCalls, { label, ok: false, text });
    }
  }

  private _addCall(list: typeof this._calls, call: CallResult) {
    list.update((calls) => [call, ...calls].slice(0, 6)); // newest first, max 6
  }
}
