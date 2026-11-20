```html child-component.component.html
<button class="big-red-button" (click)="onClick()">Big red button</button>
```

```ts child-component.component.ts
import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-child-component',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './child-component.component.html',
    styleUrl: '../output.component.css',
})
export class ChildComponentComponent {
    outputValue = output<string>();

    onClick() {
        this.outputValue.emit('Boom!🧨💥💥');
    }
}
```

```html output.component.html
<!-- $event = emitted value -->
<app-child-component (outputValue)="onClick($event)" />
<p class="boom">{{ output() }}</p>
```

```ts output.component.ts
import { Component, signal } from '@angular/core';
import { ChildComponentComponent } from './child-component/child-component.component';

@Component({
    selector: 'app-output',
    imports: [ChildComponentComponent],
    templateUrl: './output.component.html',
    styleUrl: './output.component.css',
})
export class OutputComponent {
    output = signal<string>('');

    onClick(value: string) {
        this.output.set(value);
    }
}
```

```css output.component.css
.big-red-button {
    margin: 10px;
    padding: 10px;
    background-color: darkred;
    color: white;
    border: white;
    border-radius: 5px;
    font-size: 20px;
}

.boom {
    margin: 10px;
    font-size: 40px;
    text-transform: uppercase;
}
```
