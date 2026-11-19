```html input.component.html
<!-- Give both inputs -->
<app-child-component [inputString]="String()" [inputUser]="User()" />

<!-- Only the required one: inputUser uses its default value -->
<app-child-component [inputString]="String()" />
```

```ts input.component.ts
import { Component, signal } from '@angular/core';
import { RegisterData } from '../../../core/models/user.interface';
import { GenderEnum } from '../../../core/enums/gender.enum';
import { ChildComponentComponent } from './child-component/child-component.component';

@Component({
  selector: 'app-input',
  imports: [ChildComponentComponent],
  templateUrl: './input.component.html',
})
export class InputComponent {
  String = signal<string>('Parent given value');

  User = signal<RegisterData>({
    name: 'Bob',
    email: 'bob@email.bob',
    password: 'BobIsTheBest99#',
    birthdate: '2000-09-22',
    height: 195,
    gender: GenderEnum.MALE,
    subscription: 'premium',
    agreeToTerms: true,
  });
}
```

```html child-component.component.html
<p>This is the string you passed : {{ inputString() }}</p>

<ul>
  <li>{{ inputUser().name }}</li>
  <li>{{ inputUser().email }}</li>
  <li>{{ inputUser().subscription }}</li>
</ul>
```

```ts child-component.component.ts
import { Component, input } from '@angular/core';
import { RegisterData } from '../../../../core/models/user.interface';
import { GenderEnum } from '../../../../core/enums/gender.enum';

@Component({
  selector: 'app-child-component',
  templateUrl: './child-component.component.html',
})
export class ChildComponentComponent {
  // If the input is ABSOLUTELY necessary to make the component work, add required.
  inputString = input.required<string>();

  // Otherwise, leave required out and give a default value.
  inputUser = input<RegisterData>({
    name: 'Default',
    email: 'default@email.fake',
    password: '',
    birthdate: '',
    height: 50,
    gender: GenderEnum.OTHER,
    subscription: 'free',
    agreeToTerms: false,
  });
}
```
