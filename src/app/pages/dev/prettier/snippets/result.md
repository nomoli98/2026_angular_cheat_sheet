```ts before.ts
import { Component } from '@angular/core';
@Component({ selector: 'app-hello', template: `<p>Hello {{ name }}</p>` })
export class HelloComponent {
    name = 'Bob';
}
```

```ts after.ts
import { Component } from '@angular/core';
@Component({ selector: 'app-hello', template: `<p>Hello {{ name }}</p>` })
export class HelloComponent {
    name = 'Bob';
}
```
