```html signal-form.component.html
<!-- Bootstrap: .is-invalid + .invalid-feedback -->
<form action="" (submit)="onSubmit($event)" class="card card-body">

  <div class="mb-3">
    <label for="name" class="form-label">Name</label>
    <input id="name" type="text" class="form-control" [formField]="registerForm.name"
           [class.is-invalid]="registerForm.name().touched() && registerForm.name().invalid()">
    @if (registerForm.name().touched()) {
      @for (error of registerForm.name().errors(); track error.kind) {
        <div class="invalid-feedback">{{ error.message }}</div>
      }
    }
  </div>

  <div class="mb-3">
    <label for="email" class="form-label">Email</label>
    <input id="email" type="email" class="form-control" [formField]="registerForm.email"
           [class.is-invalid]="registerForm.email().touched() && registerForm.email().invalid()">
    @if (registerForm.email().touched()) {
      @for (error of registerForm.email().errors(); track error.kind) {
        <div class="invalid-feedback">{{ error.message }}</div>
      }
    }
  </div>

  <div class="mb-3">
    <label for="password" class="form-label">Password</label>
    <input id="password" type="password" class="form-control" [formField]="registerForm.password"
           [class.is-invalid]="registerForm.password().touched() && registerForm.password().invalid()">
    @if (registerForm.password().touched()) {
      @for (error of registerForm.password().errors(); track error.kind) {
        <div class="invalid-feedback">{{ error.message }}</div>
      }
    }
  </div>

  <div class="mb-3">
    <label for="birthdate" class="form-label">Birthdate</label>
    <input id="birthdate" type="date" class="form-control" [formField]="registerForm.birthdate"
           [class.is-invalid]="registerForm.birthdate().touched() && registerForm.birthdate().invalid()">
    @if (registerForm.birthdate().touched()) {
      @for (error of registerForm.birthdate().errors(); track error.kind) {
        <div class="invalid-feedback">{{ error.message }}</div>
      }
    }
  </div>

  <div class="mb-3">
    <label for="height" class="form-label">Height</label>
    <input id="height" type="number" class="form-control" [formField]="registerForm.height"
           [class.is-invalid]="registerForm.height().touched() && registerForm.height().invalid()">
    @if (registerForm.height().touched()) {
      @for (error of registerForm.height().errors(); track error.kind) {
        <div class="invalid-feedback">{{ error.message }}</div>
      }
    }
  </div>

  <div class="mb-3">
    <label for="gender" class="form-label">Gender</label>
    <!-- .form-select -->
    <select id="gender" class="form-select" [formField]="registerForm.gender"
            [class.is-invalid]="registerForm.gender().touched() && registerForm.gender().invalid()">
      <option value="">Choose a gender...</option>
      <option value="{{GenderEnum.FEMALE}}">{{ GenderEnum.FEMALE }}</option>
      <option value="{{GenderEnum.MALE}}">{{ GenderEnum.MALE }}</option>
      <option value="{{GenderEnum.OTHER}}">{{ GenderEnum.OTHER }}</option>
    </select>
    @if (registerForm.gender().touched()) {
      @for (error of registerForm.gender().errors(); track error.kind) {
        <div class="invalid-feedback">{{ error.message }}</div>
      }
    }
  </div>

  <!-- .form-check -->
  <div class="mb-3">
    <div class="form-check">
      <input type="radio" value="free" id="free" class="form-check-input"
             [formField]="registerForm.subscription"
             (click)="toggleSubscription('free', $event)" />
      <label for="free" class="form-check-label">Free</label>
    </div>
    <div class="form-check">
      <input type="radio" value="premium" id="premium" class="form-check-input"
             [formField]="registerForm.subscription"
             (click)="toggleSubscription('premium', $event)" />
      <label for="premium" class="form-check-label">Premium</label>
    </div>
    @if (registerForm.subscription().touched()) {
      @for (error of registerForm.subscription().errors(); track error.kind) {
        <!-- d-block: force visible -->
        <div class="invalid-feedback d-block">{{ error.message }}</div>
      }
    }
  </div>

  <div class="mb-3 form-check">
    <input type="checkbox" id="agreeToTerms" class="form-check-input" [formField]="registerForm.agreeToTerms" />
    <label for="agreeToTerms" class="form-check-label">I agree to the terms</label>
    @if (registerForm.agreeToTerms().touched()) {
      @for (error of registerForm.agreeToTerms().errors(); track error.kind) {
        <div class="invalid-feedback d-block">{{ error.message }}</div>
      }
    }
  </div>

  <button type="submit" class="btn btn-primary" [disabled]="registerForm().invalid()">Submit</button>
</form>
```

```ts signal-form.component.ts
import { Component, signal } from '@angular/core';
import { email, form, FormField, max, min, required, validate } from '@angular/forms/signals';
import { GenderEnum } from '@core/enums/gender.enum';
import { RegisterRequest } from '@core/requests/register.request';
import { strongPassword } from '@core/validators/signal-form/strong-password.validator';
import { birthdate } from '@core/validators/signal-form/birthdate.validator';

@Component({
  imports: [FormField],
  selector: 'app-signal-form',
  templateUrl: './signal-form.component.html',
})
export class SignalFormComponent {
  protected readonly GenderEnum = GenderEnum;
  protected EmptyForm = signal<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    birthdate: '',
    height: 50,
    gender: GenderEnum.OTHER,
    subscription: 'free',
    agreeToTerms: false,
  });

  // model → field tree
  protected registerForm = form(this.EmptyForm, (field) => {
    required(field.name, { message: 'Name is required' });

    required(field.email, { message: 'Email is required' });
    email(field.email, { message: 'Email must be an valid email' });

    required(field.password, { message: 'Password is required' });
    // custom validators
    strongPassword(field.password);

    // 'YYYY-MM-DD' ('' = empty)
    required(field.birthdate, { message: 'Birthdate is required' });
    // with parameters
    birthdate(field.birthdate, { minAge: 18, maxAge: 120 });

    // ranges
    min(field.height, 50, { message: 'Height must be above 50cm' });
    max(field.height, 275, { message: 'Height must be below 275cm' });

    required(field.gender, { message: 'Gender is required' });

    // undefined = valid, { kind } = invalid
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

    // call your service
    console.log('It works! ' + this.registerForm().value().name);

    this.resetForm();
  }

  resetForm() {
    this.EmptyForm.set({
      name: '',
      email: '',
      password: '',
      birthdate: '',
      height: 50,
      gender: GenderEnum.OTHER,
      subscription: 'free',
      agreeToTerms: false,
    });
    this.registerForm().reset();
  }

  // uncheckable radio
  toggleSubscription(value: 'free' | 'premium', event: MouseEvent) {
    const field = this.registerForm.subscription();
    const input = event.target as HTMLInputElement;

    if (field.value() === value) {
      // 2nd click: clear
      field.value.set('free');
      input.checked = false; // the browser re-checked it
    } else {
      field.value.set(value);
    }
    field.markAsTouched();
  }

  protected readonly form = form;
}
```
