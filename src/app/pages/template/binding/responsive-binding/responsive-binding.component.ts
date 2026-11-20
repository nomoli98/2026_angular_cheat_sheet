import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import conditionalBinding from './snippets/conditional-binding.md';
import signals from './snippets/signals.md';

@Component({
  selector: 'app-responsive-binding',
  standalone: true,
  imports: [CodeSnippetComponent, CommonModule],
  templateUrl: './responsive-binding.component.html',
  styles: `
    .underlined {
      text-decoration: underline;
    }
  `,
})
export class ResponsiveBindingComponent {
  // page snippets
  protected readonly snippets = { conditionalBinding, signals };

  protected clicked = false;

  value = signal('Initial value');
  protected inputPlaceholder = signal('On a native property');
  protected isDisabled = signal(false);
  protected isUnderlined = signal(true);
}
