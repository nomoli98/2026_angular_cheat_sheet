```html reactive-form.component.html
<form [formGroup]="formRegister" (ngSubmit)="onSubmit()">

  <div>
    <label for="name">Name</label>
    <input type="text" name="name" id="name" placeholder="name123"
           formControlName="name"
           [class.invalid]="formRegister.get('name')?.invalid && formRegister.get('name')?.touched" />
    @if (formRegister.get('name')?.invalid && formRegister.get('name')?.touched) {
      <p>Enter valid name</p>
    }
  </div>

  <div>
    <label for="email">Email</label>
    <input type="text" name="email" id="email" placeholder="example@email.com"
           formControlName="email"
           [class.invalid]="formRegister.get('email')?.invalid && formRegister.get('email')?.touched" />
    @if (formRegister.get('email')?.invalid && formRegister.get('email')?.touched) {
      <p>Enter valid email address</p>
    }
  </div>

  <div>
    <label for="password">Password</label>
    <input type="password" name="password" id="password" placeholder="Password123"
           formControlName="password"
           [class.invalid]="formRegister.get('password')?.invalid && formRegister.get('password')?.touched" />
    @if (formRegister.get('password')?.invalid && formRegister.get('password')?.touched) {
      <p>Enter valid password</p>
    }
  </div>

  <div>
    <label for="birthdate">Birthdate</label>
    <input type="date" name="birthdate" id="birthdate"
           formControlName="birthdate"
           [class.invalid]="formRegister.get('birthdate')?.invalid && formRegister.get('birthdate')?.touched" />
    @if (formRegister.get('birthdate')?.invalid && formRegister.get('birthdate')?.touched) {
      <p>Enter valid birthdate</p>
    }
  </div>

  <div>
    <label for="height">Height</label>
    <input type="number" name="height" id="height" formControlName="height"
           [class.invalid]="formRegister.get('height')?.invalid && formRegister.get('height')?.touched" />
    @if (formRegister.get('height')?.invalid && formRegister.get('height')?.touched) {
      <p>Enter valid height</p>
    }
  </div>

  <div>
    <label for="gender">Gender</label>
    <select name="gender" id="gender" formControlName="gender"
            [class.invalid]="formRegister.get('gender')?.invalid && formRegister.get('gender')?.touched">
      <option value="">Choose a gender...</option>
      <option value="{{GenderEnum.FEMALE}}">{{ GenderEnum.FEMALE }}</option>
      <option value="{{GenderEnum.MALE}}">{{ GenderEnum.MALE }}</option>
      <option value="{{GenderEnum.OTHER}}">{{ GenderEnum.OTHER }}</option>
    </select>
    @if (formRegister.get('gender')?.invalid && formRegister.get('gender')?.touched) {
      <p>Enter valid gender</p>
    }
  </div>

  <div>
    <div>
      <input type="radio" value="free" id="free" formControlName="subscription" />
      <label for="free">Free</label>
    </div>
    <div>
      <input type="radio" value="premium" id="premium" formControlName="subscription" />
      <label for="premium">Premium</label>
    </div>
    @if (formRegister.get('subscription')?.invalid && formRegister.get('subscription')?.touched) {
      <p>Choose a Subscription</p>
    }
  </div>

  <div>
    <input type="checkbox" id="agreeToTerms" formControlName="agreeToTerms" />
    <label for="agreeToTerms">I agree to the terms</label>
    @if (formRegister.get('agreeToTerms')?.invalid && formRegister.get('agreeToTerms')?.touched) {
      <p>You need to agree to the terms</p>
    }
  </div>

  <button [disabled]="formRegister.invalid || loading()" type="submit">
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
import { strongPasswordValidator } from '../../../core/validators/reactive-form/strong-password.validator';
import { birthdateValidator } from '../../../core/validators/reactive-form/birthdate.validator';
import { GenderEnum } from '../../../core/enums/gender.enum';
import { enumValidator } from '../../../core/validators/reactive-form/in-enum.validator';
import { inValidator } from '../../../core/validators/reactive-form/in-string-list.validator';
import { RegisterData } from '../../../core/models/user.interface';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-template-form',
  templateUrl: './reactive-form.component.html',
  styleUrl: './reactive-form.component.css',
})
export class ReactiveFormComponent {
  private readonly _formBuilder = inject(FormBuilder);
  protected readonly GenderEnum = GenderEnum;

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
      const user: RegisterData = {
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
}
```

```css reactive-form.component.css
/* A red border on invalid fields */
.invalid {
  border: 1px solid red;
}
```
