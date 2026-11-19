```html responsive-binding.component.html
<p>{{ value() }}</p>
<button (click)="value.set('Changed value')">Change value</button>

<input [placeholder]="inputPlaceholder()" />
<button [disabled]="isDisabled()">Button</button>
<p [class.underlined]="isUnderlined()">On a class</p>

<button (click)="inputPlaceholder.set('new placeholder')">Change placeholder</button>
<button (click)="isDisabled.set(!isDisabled())">Toggle button</button>
<button (click)="isUnderlined.set(!isUnderlined())">Toggle underline</button>
```

```ts responsive-binding.component.ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-responsive-binding',
  templateUrl: './responsive-binding.component.html',
  styles: `
    .underlined {
      text-decoration: underline;
    }
  `,
})
export class ResponsiveBindingComponent {
  value = signal('Initial value');
  protected inputPlaceholder = signal('On a native property');
  protected isDisabled = signal(false);
  protected isUnderlined = signal(true);
}
```
