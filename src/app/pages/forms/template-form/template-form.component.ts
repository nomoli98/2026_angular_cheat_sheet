import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import templateForm from './snippets/template-form.md';
import { StrongPasswordDirective } from '@core/validators/template-form/strong-password.directive';
import { BirthdateDirective } from '@core/validators/template-form/birthday.directive';
import { InEnumDirective } from '@core/validators/template-form/in-enum.directive';
import { InListDirective } from '@core/validators/template-form/in-list.directive';
import { GenderEnum } from '@core/enums/gender.enum';

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
  // page snippets
  protected readonly snippets = { templateForm };

  loading = signal<boolean>(false);

  // [(ngModel)] keeps these in sync
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
    // call your service here
    console.log(this.user);
  }

  protected readonly GenderEnum = GenderEnum;
}
