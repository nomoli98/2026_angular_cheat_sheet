```html template-form.component.html
<!-- #form="ngForm" gives us access to the whole form (valid, invalid...) -->
<form #form="ngForm" (ngSubmit)="onSubmit(form)">

  <!-- NAME -->
  <!-- #name="ngModel" gives us access to this field (invalid, touched...) -->
  <div>
    <label for="name">Name</label>
    <input type="text" id="name" name="name" placeholder="name123"
           [(ngModel)]="user.name" #name="ngModel"
           required
           [class.invalid]="name.invalid && name.touched" />
    @if (name.invalid && name.touched) {
      <p>Enter valid name</p>
    }
  </div>

  <!-- EMAIL -->
  <div>
    <label for="email">Email</label>
    <input type="text" id="email" name="email" placeholder="example@email.com"
           [(ngModel)]="user.email" #email="ngModel"
           required email
           [class.invalid]="email.invalid && email.touched" />
    @if (email.invalid && email.touched) {
      <p>Enter valid email address</p>
    }
  </div>

  <!-- PASSWORD: custom validator "appStrongPassword" -->
  <div>
    <label for="password">Password</label>
    <input type="password" id="password" name="password" placeholder="Password123"
           [(ngModel)]="user.password" #password="ngModel"
           required appStrongPassword
           [class.invalid]="password.invalid && password.touched" />
    @if (password.invalid && password.touched) {
      <p>Password needs 8+ characters, an uppercase letter, a lowercase letter and a number</p>
    }
  </div>

  <!-- BIRTHDATE: custom validator "appBirthdate" (age between 0 and 135) -->
  <div>
    <label for="birthdate">Birthdate</label>
    <input type="date" id="birthdate" name="birthdate"
           [(ngModel)]="user.birthdate" #birthdate="ngModel"
           required appBirthdate [minAge]="0" [maxAge]="135"
           [class.invalid]="birthdate.invalid && birthdate.touched" />
    @if (birthdate.invalid && birthdate.touched) {
      <p>Enter valid birthdate</p>
    }
  </div>

  <!-- HEIGHT: between 50 and 275 -->
  <div>
    <label for="height">Height</label>
    <input type="number" id="height" name="height"
           [(ngModel)]="user.height" #height="ngModel"
           min="50" max="275"
           [class.invalid]="height.invalid && height.touched" />
    @if (height.invalid && height.touched) {
      <p>Height must be between 50 and 275</p>
    }
  </div>

  <!-- GENDER: custom validator "appInEnum" (value must be in GenderEnum) -->
  <div>
    <label for="gender">Gender</label>
    <select id="gender" name="gender"
            [(ngModel)]="user.gender" #gender="ngModel"
            required [appInEnum]="GenderEnum"
            [class.invalid]="gender.invalid && gender.touched">
      <option value="">Choose a gender...</option>
      <option [value]="GenderEnum.FEMALE">{{ GenderEnum.FEMALE }}</option>
      <option [value]="GenderEnum.MALE">{{ GenderEnum.MALE }}</option>
      <option [value]="GenderEnum.OTHER">{{ GenderEnum.OTHER }}</option>
    </select>
    @if (gender.invalid && gender.touched) {
      <p>Enter valid gender</p>
    }
  </div>

  <!-- SUBSCRIPTION: custom validator "appInList" -->
  <!-- Both radios share the same name, so they are one field -->
  <div>
    <div>
      <input type="radio" name="subscription" value="free" id="free"
             [(ngModel)]="user.subscription" #subscription="ngModel"
             required [appInList]="['free', 'premium']" />
      <label for="free">Free</label>
    </div>
    <div>
      <input type="radio" name="subscription" value="premium" id="premium"
             [(ngModel)]="user.subscription"
             required [appInList]="['free', 'premium']" />
      <label for="premium">Premium</label>
    </div>
    @if (subscription.invalid && subscription.touched) {
      <p>Choose a Subscription</p>
    }
  </div>

  <!-- TERMS: "required" on a checkbox means it must be checked -->
  <div>
    <input type="checkbox" name="agreeToTerms" id="agreeToTerms"
           [(ngModel)]="user.agreeToTerms" #agreeToTerms="ngModel"
           required />
    <label for="agreeToTerms">I agree to the terms</label>
    @if (agreeToTerms.invalid && agreeToTerms.touched) {
      <p>You need to agree to the terms</p>
    }
  </div>

  <button type="submit" [disabled]="form.invalid || loading()">
    @if (!loading()) {
      Register
    } @else {
      Loading...
    }
  </button>
</form>
```

```ts template-form.component.ts
import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { GenderEnum } from '../../../core/enums/gender.enum';
import { StrongPasswordDirective } from '../../../core/validators/template-form/strong-password.directive';
import { BirthdateDirective } from '../../../core/validators/template-form/birthday.directive';
import { InEnumDirective } from '../../../core/validators/template-form/in-enum.directive';
import { InListDirective } from '../../../core/validators/template-form/in-list.directive';

@Component({
  imports: [
    FormsModule,
    StrongPasswordDirective,
    BirthdateDirective,
    InEnumDirective,
    InListDirective,
  ],
  selector: 'app-template-form',
  templateUrl: './template-form.component.html',
  styleUrl: './template-form.component.css',
})
export class TemplateFormComponent {
  loading = signal<boolean>(false);

  // The form data. [(ngModel)] in the HTML keeps these values in sync with the inputs.
  user = {
    name: '',
    email: '',
    password: '',
    birthdate: '', // 'YYYY-MM-DD' string, the format <input type="date"> uses
    height: 50,
    gender: GenderEnum.OTHER,
    subscription: 'free',
    agreeToTerms: false,
  };

  protected readonly GenderEnum = GenderEnum;

  onSubmit(form: NgForm) {
    // Show the error messages on every field
    form.control.markAllAsTouched();

    if (form.invalid) {
      return;
    }

    this.loading.set(true);
    // Call your service here
    console.log(this.user);
  }
}
```

```css template-form.component.css
/* A red border on invalid fields */
.invalid {
  border: 1px solid red;
}
```
