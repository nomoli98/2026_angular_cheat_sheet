import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import forLoop from './snippets/for.md';

@Component({
  selector: 'app-loops',
  standalone: true,
  imports: [CodeSnippetComponent, CommonModule],
  templateUrl: './loops.component.html'
})
export class LoopsComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { forLoop };

  protected items = [
    {id: 1, name: 'item 1'},
    {id: 2, name: 'item 2'},
    {id: 3, name: 'item 3'},
    {id: 4, name: 'item 4'},
    {id: 5, name: 'item 5'},
    {id: 6, name: 'item 6'},
  ]

}
