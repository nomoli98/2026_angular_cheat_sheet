```html condition.component.html
@if (firstOption()) {
  <p>This is the first option</p>
} @else if (secondOption()) {
  <p>This is the second option</p>
} @else {
  <p>This is none</p>
}

<button (click)="firstOption.set(true); secondOption.set(false)">Show first option</button>
<button (click)="secondOption.set(true); firstOption.set(false)">Show second option</button>
<button (click)="firstOption.set(false); secondOption.set(false)">Show none</button>
```

```ts condition.component.ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
})
export class ConditionComponent {
  protected firstOption = signal(true);
  protected secondOption = signal(false);
}
```
