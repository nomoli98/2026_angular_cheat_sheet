import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CodeSnippetComponent } from '@app/shared/code-snippet/code-snippet.component';
import templateForm from './snippets/template-form.md';
import { StrongPasswordDirective } from '@app/core/validators/template-form/strong-password.directive';
import { BirthdateDirective } from '@app/core/validators/template-form/birthday.directive';
import { InEnumDirective } from '@app/core/validators/template-form/in-enum.directive';
import { InListDirective } from '@app/core/validators/template-form/in-list.directive';
import { GenderEnum } from '@app/core/enums/gender.enum';

@Component({
  imports: [
    CodeSnippetComponent,
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
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { templateForm };

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

  protected readonly GenderEnum = GenderEnum;
}
