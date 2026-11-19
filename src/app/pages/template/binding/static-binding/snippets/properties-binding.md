```html static-binding.component.html
<!-- Native properties -->
<input [placeholder]="inputPlaceholder" />
<button [disabled]="isDisabled">Disabled button</button>

<!-- Components properties (the child has value = input.required<string>()) -->
<app-child-component [value]="inputValue" />

<!-- Attributes binding: use attr. for things that are not DOM properties -->
<p [attr.role]="pRole" [attr.aria-live]="live">Status: OK</p>

<!-- Text interpolation in properties and attributes -->
<img src="" alt="Profile photo of {{ firstName }}" />

<!-- Style property binding -->
<p [class.underlined]="isUnderlined">Give a condition for a style class.</p>
<p [class]="listClasses">Or just pass a list of classes</p>
```

```ts static-binding.component.ts
import { Component } from '@angular/core';
import { ChildComponentComponent } from '../child-component/child-component.component';

@Component({
  selector: 'app-static-binding',
  imports: [ChildComponentComponent],
  templateUrl: './static-binding.component.html',
  styles: `
    .underlined {
      text-decoration: underline;
    }

    .highlighted {
      background-color: pink;
    }
  `,
})
export class StaticBindingComponent {
  isDisabled = true;
  inputPlaceholder = 'placeholder';
  inputValue = 'The input value';
  pRole = 'status';
  live = 'polite';
  firstName = 'Bob';
  isUnderlined = true;
  listClasses = 'highlighted';
}
```

```html child-component.component.html
This is the passed value : {{ value() }}
```

```ts child-component.component.ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-child-component',
  templateUrl: './child-component.component.html',
})
export class ChildComponentComponent {
  // Always give input() a type, otherwise the value is `unknown`
  value = input.required<string>();
}
```
