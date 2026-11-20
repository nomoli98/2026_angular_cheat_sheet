import { Component, signal } from '@angular/core';
import { ChildComponentComponent } from './child-component/child-component.component';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import outputCode from './snippets/output.md';

@Component({
  selector: 'app-output',
  imports: [CodeSnippetComponent, ChildComponentComponent],
  templateUrl: './output.component.html',
  styleUrl: './output.component.css'
})
export class OutputComponent {
  // page snippets
  protected readonly snippets = { outputCode };

  output = signal<string>('');

  onClick(value: string) {
    this.output.set(value);
  }
}
