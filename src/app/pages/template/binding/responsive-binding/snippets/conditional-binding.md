```html responsive-binding.component.html
<button [disabled]="clicked" (click)="clicked = !clicked">Click to disable</button>
```

```ts responsive-binding.component.ts
import { Component } from '@angular/core';

@Component({
    selector: 'app-responsive-binding',
    templateUrl: './responsive-binding.component.html',
})
export class ResponsiveBindingComponent {
    protected clicked = false;
}
```
