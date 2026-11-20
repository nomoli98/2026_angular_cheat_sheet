import { Component, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  max,
  maxLength,
  min,
  minLength,
  required,
} from '@angular/forms/signals';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import { strongPassword } from '@core/validators/signal-form/strong-password.validator';
import { birthdate } from '@core/validators/signal-form/birthdate.validator';
import { matchField } from '@core/validators/signal-form/match-field.validator';
import { emailTaken } from '@core/validators/signal-form/email-taken.validator';
import builtIn from './snippets/built-in.md';
import custom from './snippets/custom.md';
import crossField from './snippets/cross-field.md';
import async from './snippets/async.md';

@Component({
  imports: [CodeSnippetComponent, FormField],
  selector: 'app-signal-validators',
  templateUrl: './signal-validators.component.html',
})
export class SignalValidatorsComponent {
  // The code shown on the page
  protected readonly snippets = { builtIn, custom, crossField, async };

  // 1. Built-in
  protected readonly builtInModel = signal({ name: '', height: 50, agreeToTerms: false });
  protected readonly builtInForm = form(this.builtInModel, (field) => {
    required(field.name, { message: 'Name is required' });
    minLength(field.name, 2, { message: 'At least 2 characters' });
    maxLength(field.name, 50, { message: 'At most 50 characters' });

    min(field.height, 50, { message: 'Minimum 50 cm' });
    max(field.height, 275, { message: 'Maximum 275 cm' });

    required(field.agreeToTerms, { message: 'You must accept the terms' }); // false = empty
  });

  // 2. Custom
  protected readonly customModel = signal({ password: '', birthdate: '' });
  protected readonly customForm = form(this.customModel, (field) => {
    required(field.password, { message: 'Password is required' });
    strongPassword(field.password);

    required(field.birthdate, { message: 'Birthdate is required' });
    birthdate(field.birthdate, { minAge: 18, maxAge: 120 });
  });

  // 3. Cross-field
  protected readonly crossModel = signal({ password: '', confirmPassword: '' });
  protected readonly crossForm = form(this.crossModel, (field) => {
    required(field.password, { message: 'Password is required' });
    required(field.confirmPassword, { message: 'Please confirm the password' });
    matchField(field.confirmPassword, field.password);
  });

  // 4. Async
  protected readonly asyncModel = signal({ email: '' });
  protected readonly asyncForm = form(this.asyncModel, (field) => {
    required(field.email, { message: 'Email is required' });
    email(field.email, { message: 'Not a valid email' });
    emailTaken(field.email);
  });
}
