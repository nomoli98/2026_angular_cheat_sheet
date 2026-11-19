```html loops.component.html
<!-- track a unique property (the default choice) -->
<ul>
  @for (item of items; track item.id) {
    <li>{{ item.name }}</li>
  }
</ul>

<!-- track $index: only for lists that never change order or size -->
<ul>
  @for (item of items; track $index) {
    <li>{{ item.name }}</li>
  }
</ul>
```

```ts loops.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-loops',
  templateUrl: './loops.component.html',
})
export class LoopsComponent {
  protected items = [
    { id: 1, name: 'item 1' },
    { id: 2, name: 'item 2' },
    { id: 3, name: 'item 3' },
    { id: 4, name: 'item 4' },
    { id: 5, name: 'item 5' },
    { id: 6, name: 'item 6' },
  ];
}
```
