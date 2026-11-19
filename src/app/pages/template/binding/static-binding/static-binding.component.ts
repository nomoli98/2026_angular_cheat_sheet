import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildComponentComponent } from '../child-component/child-component.component';
import { CodeSnippetComponent } from '../../../../../../../angular-22-cheat-sheet/src/app/shared/code-snippet/code-snippet.component';
import dataBinding from './snippets/data-binding.md';
import propertiesBinding from './snippets/properties-binding.md';

@Component({
  selector: 'app-binding',
  standalone: true,
  imports: [CodeSnippetComponent, CommonModule, ChildComponentComponent],
  templateUrl: './static-binding.component.html',
  styles: `
    .underlined {
      text-decoration: underline;
    }

    .highlighted {
      background-color: pink;
    }
  `,
})
export class StaticBindingComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { dataBinding, propertiesBinding };

  value = 'Readonly value';
  isDisabled = true;
  inputPlaceholder = 'placeholder';
  inputValue = 'The input value';
  pRole = 'status';
  live = 'polite';
  firstName = 'Bob';
  isUnderlined = true;
  listClasses = 'highlighted';
}
