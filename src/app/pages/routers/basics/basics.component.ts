import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import declare from './snippets/declare.md';
import links from './snippets/links.md';
import params from './snippets/params.md';
import redirect from './snippets/redirect.md';

@Component({
  selector: 'app-basics',
  imports: [CodeSnippetComponent, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './basics.component.html',
})
export class BasicsComponent {
  // page snippets
  protected readonly snippets = { declare, links, params, redirect };

  private router = inject(Router);

  goToSignalForm() {
    this.router.navigate(['/form', 'signal-form']);
  }

  goToUser42() {
    this.router.navigate(['/router/basics/user', 42], { queryParams: { tab: 'settings' } });
  }
}
