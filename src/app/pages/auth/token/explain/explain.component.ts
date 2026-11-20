import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { TokenAuthController } from '@core/controllers/token-auth.controller';
import { TokenAuthService } from '@core/services/token-auth.service';
import { SKIP_TOKEN } from '@core/interceptors/token.interceptor';
import { errorMessage } from '@core/controllers/error-message';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import server from './snippets/server.md';
import angular from './snippets/angular.md';

const BOB = { email: 'bob@email.bob', password: 'BobIsTheBest99#' };

interface CallResult {
  label: string;
  ok: boolean;
  text: string;
}

@Component({
  imports: [CodeSnippetComponent, RouterLink, JsonPipe],
  selector: 'app-token-explain',
  templateUrl: './explain.component.html',
})
export class TokenExplainComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { server, angular };

  private readonly _http = inject(HttpClient);
  private readonly _controller = inject(TokenAuthController);
  protected readonly _auth = inject(TokenAuthService);

  // The 3 parts of the token: header.payload.signature
  protected readonly _parts = computed(() => {
    const [header = '', payload = '', signature = ''] = (this._auth.token() ?? '').split('.');
    return { header, payload, signature };
  });

  // A clock, so the countdown moves (exp is in SECONDS)
  private readonly _now = signal(Date.now());
  protected readonly _secondsLeft = computed(() => {
    const exp = this._auth.payload()?.exp;
    return exp ? Math.max(0, Math.round(exp - this._now() / 1000)) : 0;
  });

  protected readonly _error = signal<string | null>(null);
  protected readonly _calls = signal<CallResult[]>([]); // newest first

  constructor() {
    const timer = setInterval(() => this._now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer)); // stop it when the page closes
  }

  async onLogin(expiresInSeconds?: number) {
    this._error.set(null);
    try {
      await this._controller.login(BOB, expiresInSeconds);
    } catch (err) {
      this._error.set(errorMessage(err));
    }
  }

  async onLogout() {
    await this._controller.logout();
    this._calls.set([]);
  }

  // 1. The normal way: the interceptor adds the token
  async callWithToken() {
    await this._call('with your token', () => this._controller.me());
  }

  // 2. No token at all (SKIP_TOKEN tells the interceptor to leave this request alone)
  async callWithoutToken() {
    await this._call('without a token', () =>
      firstValueFrom(this._http.get(this._meUrl, { context: this._skip() })),
    );
  }

  // 3. Change the payload (role: admin!) but keep the old signature → the server sees it
  async callWithTamperedToken() {
    const { header, payload, signature } = this._parts();
    const data = { ...this._auth.payload(), name: 'Hacker', role: 'admin' };
    const forged = `${header}.${base64url(JSON.stringify(data))}.${signature}`;
    await this._call('with a modified token (role: admin)', () =>
      firstValueFrom(
        this._http.get(this._meUrl, {
          context: this._skip(),
          headers: { Authorization: `Bearer ${forged}` },
        }),
      ),
    );
  }

  private readonly _meUrl = `${environment.authUrl}/token/me`;
  private _skip() {
    return new HttpContext().set(SKIP_TOKEN, true);
  }

  private async _call(label: string, request: () => Promise<unknown>) {
    let result: CallResult;
    try {
      const user = (await request()) as { name: string; role: string };
      result = { label, ok: true, text: `200 OK: ${user.name} (${user.role})` };
    } catch (err) {
      const status = err instanceof HttpErrorResponse ? `${err.status} ` : '';
      result = { label, ok: false, text: `${status}${errorMessage(err)}` };
    }
    this._calls.update((list) => [result, ...list].slice(0, 5));
  }
}

function base64url(text: string): string {
  return btoa(text).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
