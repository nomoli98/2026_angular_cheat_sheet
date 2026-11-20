```html template-form.component.html
<!-- #form: the whole form -->
<!-- Bootstrap: .is-invalid + .invalid-feedback -->
<form #form="ngForm" (ngSubmit)="onSubmit(form)" class="card card-body">

  <!-- NAME -->
  <!-- #name: this field -->
  <div class="mb-3">
    <label for="name" class="form-label">Name</label>
    <input type="text" id="name" name="name" placeholder="name123" class="form-control"
           [(ngModel)]="user.name" #name="ngModel"
           required
           [class.is-invalid]="name.invalid && name.touched" />
    @if (name.invalid && name.touched) {
      <div class="invalid-feedback">Enter valid name</div>
    }
  </div>

  <!-- EMAIL -->
  <div class="mb-3">
    <label for="email" class="form-label">Email</label>
    <input type="text" id="email" name="email" placeholder="example@email.com" class="form-control"
           [(ngModel)]="user.email" #email="ngModel"
           required email
           [class.is-invalid]="email.invalid && email.touched" />
    @if (email.invalid && email.touched) {
      <div class="invalid-feedback">Enter valid email address</div>
    }
  </div>

  <!-- PASSWORD: appStrongPassword -->
  <div class="mb-3">
    <label for="password" class="form-label">Password</label>
    <input type="password" id="password" name="password" placeholder="Password123" class="form-control"
           [(ngModel)]="user.password" #password="ngModel"
           required appStrongPassword
           [class.is-invalid]="password.invalid && password.touched" />
    @if (password.invalid && password.touched) {
      <div class="invalid-feedback">Password needs 8+ characters, an uppercase letter, a lowercase letter and a number</div>
    }
  </div>

  <!-- BIRTHDATE: appBirthdate -->
  <div class="mb-3">
    <label for="birthdate" class="form-label">Birthdate</label>
    <input type="date" id="birthdate" name="birthdate" class="form-control"
           [(ngModel)]="user.birthdate" #birthdate="ngModel"
           required appBirthdate [minAge]="0" [maxAge]="135"
           [class.is-invalid]="birthdate.invalid && birthdate.touched" />
    @if (birthdate.invalid && birthdate.touched) {
      <div class="invalid-feedback">Enter valid birthdate</div>
    }
  </div>

  <!-- HEIGHT: between 50 and 275 -->
  <div class="mb-3">
    <label for="height" class="form-label">Height</label>
    <input type="number" id="height" name="height" class="form-control"
           [(ngModel)]="user.height" #height="ngModel"
           min="50" max="275"
           [class.is-invalid]="height.invalid && height.touched" />
    @if (height.invalid && height.touched) {
      <div class="invalid-feedback">Height must be between 50 and 275</div>
    }
  </div>

  <!-- GENDER: appInEnum -->
  <!-- .form-select -->
  <div class="mb-3">
    <label for="gender" class="form-label">Gender</label>
    <select id="gender" name="gender" class="form-select"
            [(ngModel)]="user.gender" #gender="ngModel"
            required [appInEnum]="GenderEnum"
            [class.is-invalid]="gender.invalid && gender.touched">
      <option value="">Choose a gender...</option>
      <option [value]="GenderEnum.FEMALE">{{ GenderEnum.FEMALE }}</option>
      <option [value]="GenderEnum.MALE">{{ GenderEnum.MALE }}</option>
      <option [value]="GenderEnum.OTHER">{{ GenderEnum.OTHER }}</option>
    </select>
    @if (gender.invalid && gender.touched) {
      <div class="invalid-feedback">Enter valid gender</div>
    }
  </div>

  <!-- SUBSCRIPTION: appInList -->
  <!-- same name = one field -->
  <!-- .form-check -->
  <div class="mb-3">
    <div class="form-check">
      <input type="radio" name="subscription" value="free" id="free" class="form-check-input"
             [(ngModel)]="user.subscription" #subscription="ngModel"
             required [appInList]="['free', 'premium']" />
      <label for="free" class="form-check-label">Free</label>
    </div>
    <div class="form-check">
      <input type="radio" name="subscription" value="premium" id="premium" class="form-check-input"
             [(ngModel)]="user.subscription"
             required [appInList]="['free', 'premium']" />
      <label for="premium" class="form-check-label">Premium</label>
    </div>
    @if (subscription.invalid && subscription.touched) {
      <!-- d-block: force visible -->
      <div class="invalid-feedback d-block">Choose a Subscription</div>
    }
  </div>

  <!-- TERMS: required = checked -->
  <div class="mb-3 form-check">
    <input type="checkbox" name="agreeToTerms" id="agreeToTerms" class="form-check-input"
           [(ngModel)]="user.agreeToTerms" #agreeToTerms="ngModel"
           required />
    <label for="agreeToTerms" class="form-check-label">I agree to the terms</label>
    @if (agreeToTerms.invalid && agreeToTerms.touched) {
      <div class="invalid-feedback d-block">You need to agree to the terms</div>
    }
  </div>

  <button class="btn btn-primary" type="submit" [disabled]="form.invalid || loading()">
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
import { StrongPasswordDirective } from '@core/validators/template-form/strong-password.directive';
import { BirthdateDirective } from '@core/validators/template-form/birthday.directive';
import { InEnumDirective } from '@core/validators/template-form/in-enum.directive';
import { InListDirective } from '@core/validators/template-form/in-list.directive';
import { GenderEnum } from '@core/enums/gender.enum';

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
})
export class TemplateFormComponent {
  loading = signal<boolean>(false);

  // [(ngModel)] keeps it in sync
  user = {
    name: '',
    email: '',
    password: '',
    birthdate: '', // 'YYYY-MM-DD'
    height: 50,
    gender: GenderEnum.OTHER,
    subscription: 'free',
    agreeToTerms: false,
  };

  onSubmit(form: NgForm) {
    // show every error
    form.control.markAllAsTouched();

    if (form.invalid) {
      return;
    }

    this.loading.set(true);
    // call your service
    console.log(this.user);
  }

  protected readonly GenderEnum = GenderEnum;
}
```
