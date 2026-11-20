import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import { strongPasswordValidator } from '@core/validators/reactive-form/strong-password.validator';
import { birthdateValidator } from '@core/validators/reactive-form/birthdate.validator';
import { matchFieldsValidator } from '@core/validators/reactive-form/match-fields.validator';
import { emailTakenValidator } from '@core/validators/reactive-form/email-taken.validator';
import builtIn from './snippets/built-in.md';
import custom from './snippets/custom.md';
import crossField from './snippets/cross-field.md';
import async from './snippets/async.md';

@Component({
    imports: [CodeSnippetComponent, ReactiveFormsModule, JsonPipe],
    selector: 'app-reactive-validators',
    templateUrl: './reactive-validators.component.html',
})
export class ReactiveValidatorsComponent {
    // The code shown on the page
    protected readonly snippets = { builtIn, custom, crossField, async };

    // 1. Built-in
    protected readonly builtInForm = new FormGroup({
        name: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
        }),
        height: new FormControl(50, {
            nonNullable: true,
            validators: [Validators.required, Validators.min(50), Validators.max(275)],
        }),
        agreeToTerms: new FormControl(false, {
            nonNullable: true,
            validators: Validators.requiredTrue,
        }),
    });

    // 2. Custom
    protected readonly customForm = new FormGroup({
        password: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, strongPasswordValidator()],
        }),
        birthdate: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, birthdateValidator(18, 120)],
        }),
    });

    // 3. Cross-field
    protected readonly crossForm = new FormGroup(
        {
            password: new FormControl('', { nonNullable: true, validators: Validators.required }),
            confirmPassword: new FormControl('', {
                nonNullable: true,
                validators: Validators.required,
            }),
        },
        { validators: matchFieldsValidator('password', 'confirmPassword') },
    );

    // 4. Async
    protected readonly asyncForm = new FormGroup({
        email: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.email],
            asyncValidators: [emailTakenValidator()],
        }),
    });
}
