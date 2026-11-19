import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeSnippetComponent } from '../../../../../../../angular-22-cheat-sheet/src/app/shared/code-snippet/code-snippet.component';
import nativeEvents from './snippets/native-events.md';

@Component({
  selector: 'app-event-binding',
  standalone: true,
  imports: [CodeSnippetComponent, CommonModule],
  templateUrl: './event-binding.component.html',
})
export class EventBindingComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { nativeEvents };

  value = signal('initial value');
  pressedKey = signal('');

  protected showPressedKey(event: KeyboardEvent) {
    this.pressedKey.set(event.key);
  }
}
