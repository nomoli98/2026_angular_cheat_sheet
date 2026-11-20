```html event-binding.component.html
<!-- logic in the event -->
<p>{{ value() }}</p>
<button (click)="value.set('New value')">Change value</button>

<!-- or a method ($event) -->
<p>{{ pressedKey() }}</p>
<input (keyup)="showPressedKey($event)" />
```

```ts event-binding.component.ts
import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-event-binding',
    templateUrl: './event-binding.component.html',
})
export class EventBindingComponent {
    value = signal('initial value');
    pressedKey = signal('');

    protected showPressedKey(event: KeyboardEvent) {
        this.pressedKey.set(event.key);
    }
}
```
