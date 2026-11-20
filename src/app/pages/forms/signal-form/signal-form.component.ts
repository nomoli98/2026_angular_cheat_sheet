import { Component, signal } from '@angular/core';
import { email, form, FormField, max, min, required, validate } from '@angular/forms/signals';
import { GenderEnum } from '@core/enums/gender.enum';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import signalForm from './snippets/signal-form.md';
import { RegisterRequest } from '@core/requests/register.request';
import { strongPassword } from '@core/validators/signal-form/strong-password.validator';
import { birthdate } from '@core/validators/signal-form/birthdate.validator';

@Component({
  imports: [CodeSnippetComponent, FormField],
  selector: 'app-signal-form',
  templateUrl: './signal-form.component.html',
})
export class SignalFormComponent {
  // page snippets
  protected readonly snippets = { signalForm };

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

  protected registerForm = form(this.EmptyForm, (field) => {
    required(field.name, { message: 'Name is required' });

    required(field.email, { message: 'Email is required' });
    email(field.email, { message: 'Email must be an valid email' });

    required(field.password, { message: 'Password is required' });
    // custom validators
    strongPassword(field.password);

    // 'YYYY-MM-DD' string ('' = empty)
    required(field.birthdate, { message: 'Birthdate is required' });
    // with parameters
    birthdate(field.birthdate, { minAge: 18, maxAge: 120 });

    // ranges
    min(field.height, 50, { message: 'Height must be above 50cm' });
    max(field.height, 275, { message: 'Height must be below 275cm' });

    required(field.gender, { message: 'Gender is required' });

    // validate(): return undefined (valid) or { kind, message } (invalid)
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

    // call your service here
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

  // lets a radio be unchecked
  toggleSubscription(value: 'free' | 'premium', event: MouseEvent) {
    const field = this.registerForm.subscription();
    const input = event.target as HTMLInputElement;

    if (field.value() === value) {
      // second click: clear it
      field.value.set('free');
      input.checked = false; // the browser re-checked it
    } else {
      field.value.set(value);
    }
    field.markAsTouched();
  }

  protected readonly form = form;
}
