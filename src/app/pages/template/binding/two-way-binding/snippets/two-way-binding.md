```html two-way-binding.component.html
<!-- [(ngModel)] needs FormsModule -->
<input type="text" [(ngModel)]="inputValue" />
<p>{{ inputValue }}</p>

<!-- model() -->
<button (click)="updateCount(-1)">-</button>
<span>{{ modelCount() }}</span>
<button (click)="updateCount(+1)">+</button>

<!-- or a plain signal -->
<button (click)="signalCount.set(signalCount() - 1)">-</button>
<span>{{ signalCount() }}</span>
<button (click)="signalCount.set(signalCount() + 1)">+</button>
```

```ts two-way-binding.component.ts
import { Component, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-two-way-binding',
    imports: [FormsModule],
    templateUrl: './two-way-binding.component.html',
})
export class TwoWayBindingComponent {
    inputValue = '';

    // two-way input
    modelCount = model<number>(0);

    updateCount(amount: number): void {
        this.modelCount.update((currentCount) => currentCount + amount);
    }

    signalCount = signal(0);
}
```
