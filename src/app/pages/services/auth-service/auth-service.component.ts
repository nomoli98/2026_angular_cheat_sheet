import { Component, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AuthToggleService } from '@shared/auth-toggle/auth-toggle.service';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import authService from './snippets/auth-service.md';
import guard from './snippets/guard.md';
import toggle from './snippets/toggle.md';

@Component({
  imports: [CodeSnippetComponent],
  selector: 'app-auth-service',
  templateUrl: './auth-service.component.html',
})
export class AuthServiceComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { authService, guard, toggle };

  protected readonly auth = inject(AuthService);
  protected readonly toggle = inject(AuthToggleService);
  private readonly _router = inject(Router);

  // ?returnUrl=/service/get-all, filled by the guard (withComponentInputBinding → input())
  readonly returnUrl = input<string>();

  constructor() {
    // As soon as someone is logged in, go back to the page the guard blocked
    effect(() => {
      const url = this.returnUrl();
      if (this.auth.currentUser() && url) this._router.navigateByUrl(url);
    });
  }
}
