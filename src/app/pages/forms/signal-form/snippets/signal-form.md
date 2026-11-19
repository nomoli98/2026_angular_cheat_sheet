```html signal-form.component.html
<form action="" (submit)="onSubmit($event)">

  <div>
    <label for="name">Name</label>
    <input id="name" type="text" [formField]="registerForm.name"
           [class.invalid]="registerForm.name().touched() && registerForm.name().invalid()">
    @if (registerForm.name().touched()) {
      @for (error of registerForm.name().errors(); track error.kind) {
        <p>{{ error.message }}</p>
      }
    }
  </div>

  <div>
    <label for="email">Email</label>
    <input id="email" type="email" [formField]="registerForm.email"
           [class.invalid]="registerForm.email().touched() && registerForm.email().invalid()">
    @if (registerForm.email().touched()) {
      @for (error of registerForm.email().errors(); track error.kind) {
        <p>{{ error.message }}</p>
      }
    }
  </div>

  <div>
    <label for="password">Password</label>
    <input id="password" type="password" [formField]="registerForm.password"
           [class.invalid]="registerForm.password().touched() && registerForm.password().invalid()">
    @if (registerForm.password().touched()) {
      @for (error of registerForm.password().errors(); track error.kind) {
        <p>{{ error.message }}</p>
      }
    }
  </div>

  <div>
    <label for="birthdate">Birthdate</label>
    <input id="birthdate" type="date" [formField]="registerForm.birthdate"
           [class.invalid]="registerForm.birthdate().touched() && registerForm.birthdate().invalid()">
    @if (registerForm.birthdate().touched()) {
      @for (error of registerForm.birthdate().errors(); track error.kind) {
        <p>{{ error.message }}</p>
      }
    }
  </div>

  <div>
    <label for="height">Height</label>
    <input id="height" type="number" [formField]="registerForm.height"
           [class.invalid]="registerForm.height().touched() && registerForm.height().invalid()">
    @if (registerForm.height().touched()) {
      @for (error of registerForm.height().errors(); track error.kind) {
        <p>{{ error.message }}</p>
      }
    }
  </div>

  <div>
    <label for="gender">Gender</label>
    <select id="gender" [formField]="registerForm.gender"
            [class.invalid]="registerForm.gender().touched() && registerForm.gender().invalid()">
      <option value="">Choose a gender...</option>
      <option value="{{GenderEnum.FEMALE}}">{{ GenderEnum.FEMALE }}</option>
      <option value="{{GenderEnum.MALE}}">{{ GenderEnum.MALE }}</option>
      <option value="{{GenderEnum.OTHER}}">{{ GenderEnum.OTHER }}</option>
    </select>
    @if (registerForm.gender().touched()) {
      @for (error of registerForm.gender().errors(); track error.kind) {
        <p>{{ error.message }}</p>
      }
    }
  </div>

  <div>
    <div>
      <input type="radio" value="free" id="free"
             [formField]="registerForm.subscription"
             (click)="toggleSubscription('free', $event)" />
      <label for="free">Free</label>
    </div>
    <div>
      <input type="radio" value="premium" id="premium"
             [formField]="registerForm.subscription"
             (click)="toggleSubscription('premium', $event)" />
      <label for="premium">Premium</label>
    </div>
    @if (registerForm.subscription().touched()) {
      @for (error of registerForm.subscription().errors(); track error.kind) {
        <p>{{ error.message }}</p>
      }
    }
  </div>

  <div>
    <input type="checkbox" id="agreeToTerms" [formField]="registerForm.agreeToTerms" />
    <label for="agreeToTerms">I agree to the terms</label>
    @if (registerForm.agreeToTerms().touched()) {
      @for (error of registerForm.agreeToTerms().errors(); track error.kind) {
        <p>{{ error.message }}</p>
      }
    }
  </div>

  <button type="submit" [disabled]="registerForm().invalid()">Submit</button>
</form>
```

```ts signal-form.component.ts
import { Component, signal } from '@angular/core';
import { email, form, FormField, max, min, required, validate } from '@angular/forms/signals';
import { GenderEnum } from '../../../core/enums/gender.enum';
import { RegisterData } from '../../../core/models/user.interface';
import { strongPassword } from '../../../core/validators/signal-form/strong-password.validator';
import { birthdate } from '../../../core/validators/signal-form/birthdate.validator';
import { initialRegisterData } from '../../../core/factories/register.factory';

@Component({
  imports: [FormField],
  selector: 'app-signal-form',
  templateUrl: './signal-form.component.html',
  styleUrl: './signal-form.component.css',
})
export class SignalFormComponent {
  protected readonly GenderEnum = GenderEnum;
  protected EmptyForm = signal<RegisterData>(initialRegisterData());

  // You pass you model (userDate) into the form() to create a Field Tree to access the data
  protected registerForm = form(this.EmptyForm, (field) => {
    required(field.name, { message: 'Name is required' });

    required(field.email, { message: 'Email is required' });
    email(field.email, { message: 'Email must be an valid email' });

    required(field.password, { message: 'Password is required' });
    //You can make your own validations!
    strongPassword(field.password);

    // birthdate is a 'YYYY-MM-DD' string ('' when empty), so required() works on it like any text field
    required(field.birthdate, { message: 'Birthdate is required' });
    //And you can even add parameters!
    birthdate(field.birthdate, { minAge: 18, maxAge: 120 });

    // you can impose ranges
    min(field.height, 50, { message: 'Height must be above 50cm' });
    max(field.height, 275, { message: 'Height must be below 275cm' });

    required(field.gender, { message: 'Gender is required' });

    // null or undefined means the value is valid.
    // An error object with a kind (and usually a message) means it’s invalid.
    // The validate() function creates custom validation rules.
    // It receives a validator function that accesses the field context and returns one of those two things.
    validate(field.gender, ({ value }) => {
      if (!value()) return undefined;
      const GENDERS = Object.values(GenderEnum) as string[];
      if (!GENDERS.includes(value())) {
        return {
          kind: 'invalidGender',
          message: `Gender must be one of: ${GENDERS.join(', ')}`,
        };
      }
      return undefined;
    });

    required(field.subscription, { message: 'Subscription is required' });
    validate(field.subscription, ({ value }) => {
      if (!value()) return undefined;
      if (value() !== 'free' && value() !== 'premium') {
        return {
          kind: 'invalidSubscription',
          message: `Subscription must be 'free'  or 'premium'`,
        };
      }
      return undefined;
    });

    validate(field.agreeToTerms, ({ value }) => {
      if (!value()) {
        return {
          kind: 'invalidAgreeToTerms',
          message: `You must agree to the terms`,
        };
      }
      return undefined;
    });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.registerForm().invalid()) return;

    //put here the service call
    console.log('It works! ' + this.registerForm().value().name);

    this.resetForm();
  }

  resetForm() {
    this.EmptyForm.set(initialRegisterData()); // 1. values back to defaults (fresh object)
    this.registerForm().reset(); // 2. clear touched/dirty
  }

  // helper function to be sure that the radio btn toggle correctly
  toggleSubscription(value: 'free' | 'premium', event: MouseEvent) {
    const field = this.registerForm.subscription();
    const input = event.target as HTMLInputElement;

    if (field.value() === value) {
      // Second click on the selected radio: clear it
      field.value.set('free');
      input.checked = false; // force the DOM, since the browser just re-checked it
    } else {
      field.value.set(value);
    }
    field.markAsTouched();
  }

  protected readonly form = form;
}
```

```css signal-form.component.css
/* A red border on invalid fields */
.invalid {
  border: 1px solid red;
}
```
