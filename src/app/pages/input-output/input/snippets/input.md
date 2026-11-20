```html input.component.html
<!-- both inputs -->
<app-child-component [inputString]="String()" [inputUser]="User()" />

<!-- required only → default user -->
<app-child-component [inputString]="String()" />
```

```ts input.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenderEnum } from '@core/enums/gender.enum';
import { ChildComponentComponent } from './child-component/child-component.component';
import { RegisterRequest } from '@core/requests/register.request';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule, ChildComponentComponent],
    templateUrl: './input.component.html',
})
export class InputComponent {
    String = signal<string>('Parent given value');

    User = signal<RegisterRequest>({
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
<h3>Child component:</h3>

<p>This is the string you passed : {{ inputString() }}</p>

<p>And this is the user:</p>
<ul>
    <li>{{ inputUser().name }}</li>
    <li>{{ inputUser().email }}</li>
    <li>{{ inputUser().subscription }}</li>
</ul>
```

```ts child-component.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenderEnum } from '@core/enums/gender.enum';
import { RegisterRequest } from '@core/requests/register.request';

@Component({
    selector: 'app-child-component',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './child-component.component.html',
})
export class ChildComponentComponent {
    // required
    inputString = input.required<string>();

    // optional: default value
    inputUser = input<RegisterRequest>({
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
