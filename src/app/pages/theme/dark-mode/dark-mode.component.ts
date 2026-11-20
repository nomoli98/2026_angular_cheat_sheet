import { Component, inject } from '@angular/core';
import { ThemeService } from '@shared/theme-toggle/theme.service';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import service from './snippets/service.md';
import toggle from './snippets/toggle.md';
import noFlash from './snippets/no-flash.md';

@Component({
    imports: [CodeSnippetComponent],
    selector: 'app-dark-mode',
    templateUrl: './dark-mode.component.html',
})
export class DarkModeComponent {
    // page snippets
    protected readonly snippets = { service, toggle, noFlash };

    protected readonly theme = inject(ThemeService);
}
