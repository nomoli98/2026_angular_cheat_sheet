```html reactive-form.component.html
<!-- Bootstrap: .form-label + .form-control, .is-invalid turns the field red,
     .invalid-feedback shows the message (only when the input before it is .is-invalid) -->
<form [formGroup]="formRegister" (ngSubmit)="onSubmit()" class="card card-body">

  <div class="mb-3">
    <label for="name" class="form-label">Name</label>
    <input type="text" name="name" id="name" placeholder="name123" class="form-control"
           formControlName="name"
           [class.is-invalid]="formRegister.get('name')?.invalid && formRegister.get('name')?.touched" />
    @if (formRegister.get('name')?.invalid && formRegister.get('name')?.touched) {
      <div class="invalid-feedback">Enter valid name</div>
    }
  </div>

  <div class="mb-3">
    <label for="email" class="form-label">Email</label>
    <input type="text" name="email" id="email" placeholder="example@email.com" class="form-control"
           formControlName="email"
           [class.is-invalid]="formRegister.get('email')?.invalid && formRegister.get('email')?.touched" />
    @if (formRegister.get('email')?.invalid && formRegister.get('email')?.touched) {
      <div class="invalid-feedback">Enter valid email address</div>
    }
  </div>

  <div class="mb-3">
    <label for="password" class="form-label">Password</label>
    <input type="password" name="password" id="password" placeholder="Password123" class="form-control"
           formControlName="password"
           [class.is-invalid]="formRegister.get('password')?.invalid && formRegister.get('password')?.touched" />
    @if (formRegister.get('password')?.invalid && formRegister.get('password')?.touched) {
      <div class="invalid-feedback">Enter valid password</div>
    }
  </div>

  <div class="mb-3">
    <label for="birthdate" class="form-label">Birthdate</label>
    <input type="date" name="birthdate" id="birthdate" class="form-control"
           formControlName="birthdate"
           [class.is-invalid]="formRegister.get('birthdate')?.invalid && formRegister.get('birthdate')?.touched" />
    @if (formRegister.get('birthdate')?.invalid && formRegister.get('birthdate')?.touched) {
      <div class="invalid-feedback">Enter valid birthdate</div>
    }
  </div>

  <div class="mb-3">
    <label for="height" class="form-label">Height</label>
    <input type="number" name="height" id="height" class="form-control" formControlName="height"
           [class.is-invalid]="formRegister.get('height')?.invalid && formRegister.get('height')?.touched" />
    @if (formRegister.get('height')?.invalid && formRegister.get('height')?.touched) {
      <div class="invalid-feedback">Enter valid height</div>
    }
  </div>

  <div class="mb-3">
    <label for="gender" class="form-label">Gender</label>
    <!-- <select> uses .form-select instead of .form-control -->
    <select name="gender" id="gender" class="form-select" formControlName="gender"
            [class.is-invalid]="formRegister.get('gender')?.invalid && formRegister.get('gender')?.touched">
      <option value="">Choose a gender...</option>
      <option value="{{GenderEnum.FEMALE}}">{{ GenderEnum.FEMALE }}</option>
      <option value="{{GenderEnum.MALE}}">{{ GenderEnum.MALE }}</option>
      <option value="{{GenderEnum.OTHER}}">{{ GenderEnum.OTHER }}</option>
    </select>
    @if (formRegister.get('gender')?.invalid && formRegister.get('gender')?.touched) {
      <div class="invalid-feedback">Enter valid gender</div>
    }
  </div>

  <!-- Radios and checkboxes: .form-check wrapper + .form-check-input + .form-check-label -->
  <div class="mb-3">
    <div class="form-check">
      <input type="radio" value="free" id="free" class="form-check-input" formControlName="subscription" />
      <label for="free" class="form-check-label">Free</label>
    </div>
    <div class="form-check">
      <input type="radio" value="premium" id="premium" class="form-check-input" formControlName="subscription" />
      <label for="premium" class="form-check-label">Premium</label>
    </div>
    @if (formRegister.get('subscription')?.invalid && formRegister.get('subscription')?.touched) {
      <!-- d-block: the message isn't right after an .is-invalid input, so force it visible -->
      <div class="invalid-feedback d-block">Choose a Subscription</div>
    }
  </div>

  <div class="mb-3 form-check">
    <input type="checkbox" id="agreeToTerms" class="form-check-input" formControlName="agreeToTerms" />
    <label for="agreeToTerms" class="form-check-label">I agree to the terms</label>
    @if (formRegister.get('agreeToTerms')?.invalid && formRegister.get('agreeToTerms')?.touched) {
      <div class="invalid-feedback d-block">You need to agree to the terms</div>
    }
  </div>

  <button class="btn btn-primary" [disabled]="formRegister.invalid || loading()" type="submit">
    @if (!loading()) {
      Register
    } @else {
      Loading...
    }
  </button>
</form>
```

```ts reactive-form.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { strongPasswordValidator } from '@core/validators/reactive-form/strong-password.validator';
import { birthdateValidator } from '@core/validators/reactive-form/birthdate.validator';
import { enumValidator } from '@core/validators/reactive-form/in-enum.validator';
import { GenderEnum } from '@core/enums/gender.enum';
import { inValidator } from '@core/validators/reactive-form/in-string-list.validator';
import { RegisterRequest } from '@core/requests/register.request';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-reactive-form',
  templateUrl: './reactive-form.component.html',
})
export class ReactiveFormComponent {
  private readonly _formBuilder = inject(FormBuilder);

  loading = signal<boolean>(false);

  formRegister = this._formBuilder.group({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, strongPasswordValidator()]),
    // birthdate is a 'YYYY-MM-DD' string: <input type="date"> reads and writes that format directly
    birthdate: new FormControl('', [Validators.required, birthdateValidator(0, 135)]),
    height: new FormControl(50, [Validators.min(50), Validators.max(275)]),
    gender: new FormControl(GenderEnum.OTHER, [Validators.required, enumValidator(GenderEnum)]),
    subscription: new FormControl<'free' | 'premium'>('free', [
      Validators.required,
      inValidator(['free', 'premium']),
    ]),
    agreeToTerms: new FormControl(false, Validators.requiredTrue),
  });

  onSubmit() {
    this.formRegister.markAllAsTouched();
    this.loading.set(true);
    if (this.formRegister.valid) {
      const user: RegisterRequest = {
        name: this.formRegister.value.name!,
        email: this.formRegister.value.email!,
        password: this.formRegister.value.password!,
        birthdate: this.formRegister.value.birthdate!,
        height: this.formRegister.value.height!,
        gender: this.formRegister.value.gender!,
        subscription: this.formRegister.value.subscription!,
        agreeToTerms: this.formRegister.value.agreeToTerms!,
      };
      //Call to you service here
      console.log(user);
    }
  }

  protected readonly GenderEnum = GenderEnum;
}
```
