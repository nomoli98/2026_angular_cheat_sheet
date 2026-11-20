import { Component, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import twoWayBinding from './snippets/two-way-binding.md';

@Component({
  selector: 'app-two-way-binding',
  standalone: true,
  imports: [CodeSnippetComponent, CommonModule, FormsModule],
  templateUrl: './two-way-binding.component.html',
})
export class TwoWayBindingComponent {
  // page snippets
  protected readonly snippets = { twoWayBinding };

  inputValue = '';

  modelCount = model<number>(0);
  // model(): two-way input
  updateCount(amount: number): void {
    this.modelCount.update((currentCount) => currentCount + amount);
  }

  signalCount = signal(0);
}
