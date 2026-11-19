import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import reactiveForm from './snippets/reactive-form.md';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import { strongPasswordValidator } from '@core/validators/reactive-form/strong-password.validator';
import { birthdateValidator } from '@core/validators/reactive-form/birthdate.validator';
import { enumValidator } from '@core/validators/reactive-form/in-enum.validator';
import { GenderEnum } from '@core/enums/gender.enum';
import { inValidator } from '@core/validators/reactive-form/in-string-list.validator';
import { RegisterRequest } from '@core/requests/register.request';

@Component({
  imports: [CodeSnippetComponent, ReactiveFormsModule],
  selector: 'app-reactive-form',
  templateUrl: './reactive-form.component.html',
})
export class ReactiveFormComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { reactiveForm };

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
