```html static-binding.component.html
<p>This is the value I get from the .ts file : {{ value }}</p>
```

```ts static-binding.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-binding',
  templateUrl: './static-binding.component.html',
})
export class StaticBindingComponent {
  value = 'Readonly value';
}
```
