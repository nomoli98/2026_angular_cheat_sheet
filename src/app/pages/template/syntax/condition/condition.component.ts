import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import ifElse from './snippets/if-else.md';
import switchSnippet from './snippets/switch.md';

@Component({
  selector: 'app-condition',
  standalone: true,
  imports: [CommonModule, CodeSnippetComponent],
  templateUrl: './condition.component.html'
})
export class ConditionComponent {

  protected firstOption = signal(true)
  protected secondOption = signal(false)
  switchOptions = 'A';

  // The code shown under each section (see the snippets/ folder)
  protected readonly snippets = { ifElse, switch: switchSnippet };
}
