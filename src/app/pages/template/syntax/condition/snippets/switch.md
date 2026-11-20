```html condition.component.html
@switch (switchOptions) { @case ('A') {
<p>Show A</p>
} @case ('B') {
<p>Show B</p>
} @default {
<p>Show default</p>
} }

<button (click)="switchOptions = 'A'">Show option A</button>
<button (click)="switchOptions = 'B'">Show option B</button>
<button (click)="switchOptions = 'N'">Show neither</button>
```

```ts condition.component.ts
import { Component } from '@angular/core';

@Component({
    selector: 'app-condition',
    templateUrl: './condition.component.html',
})
export class ConditionComponent {
    switchOptions = 'A';
}
```
