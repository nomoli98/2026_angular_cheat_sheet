import { Component, inject } from '@angular/core';
import { ThemeService } from '@shared/theme-toggle/theme.service';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import service from './snippets/service.md';
import toggle from './snippets/toggle.md';
import noFlash from './snippets/no-flash.md';

@Component({
  imports: [CodeSnippetComponent],
  selector: 'app-theme',
  templateUrl: './theme.component.html',
})
export class ThemeComponent {
  // page snippets
  protected readonly snippets = { service, toggle, noFlash };

  protected readonly theme = inject(ThemeService);
}
