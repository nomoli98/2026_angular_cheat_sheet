```html child-component.component.html
<button (click)="onClick()">Big red button</button>
```

```ts child-component.component.ts
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-child-component',
  templateUrl: './child-component.component.html',
})
export class ChildComponentComponent {
  outputValue = output<string>();

  onClick() {
    this.outputValue.emit('Boom!');
  }
}
```

```html output.component.html
<!-- $event = the value given to emit() -->
<app-child-component (outputValue)="onClick($event)" />
<p>{{ output() }}</p>
```

```ts output.component.ts
import { Component, signal } from '@angular/core';
import { ChildComponentComponent } from './child-component/child-component.component';

@Component({
  selector: 'app-output',
  imports: [ChildComponentComponent],
  templateUrl: './output.component.html',
})
export class OutputComponent {
  output = signal<string>('');

  onClick(value: string) {
    this.output.set(value);
  }
}
```
