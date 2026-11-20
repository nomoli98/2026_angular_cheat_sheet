import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import { StrongPasswordDirective } from '@core/validators/template-form/strong-password.directive';
import { BirthdateDirective } from '@core/validators/template-form/birthday.directive';
import { MatchFieldsDirective } from '@core/validators/template-form/match-fields.directive';
import { EmailTakenDirective } from '@core/validators/template-form/email-taken.directive';
import builtIn from './snippets/built-in.md';
import custom from './snippets/custom.md';
import crossField from './snippets/cross-field.md';
import async from './snippets/async.md';

@Component({
    imports: [
        CodeSnippetComponent,
        FormsModule,
        JsonPipe,
        StrongPasswordDirective,
        BirthdateDirective,
        MatchFieldsDirective,
        EmailTakenDirective,
    ],
    selector: 'app-template-validators',
    templateUrl: './template-validators.component.html',
})
export class TemplateValidatorsComponent {
    // The code shown on the page
    protected readonly snippets = { builtIn, custom, crossField, async };

    // One plain object per demo
    protected builtIn = { name: '', height: 50, agreeToTerms: false };
    protected custom = { password: '', birthdate: '' };
    protected cross = { password: '', confirmPassword: '' };
    protected async = { email: '' };
}
