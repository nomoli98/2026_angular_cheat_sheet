import { Component } from '@angular/core';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import install from './snippets/install.md';
import loadCss from './snippets/load-css.md';
import use from './snippets/use.md';
import forms from './snippets/forms.md';
import validation from './snippets/validation.md';
import customise from './snippets/customise.md';
import javascript from './snippets/javascript.md';

@Component({
    imports: [CodeSnippetComponent],
    selector: 'app-bootstrap',
    templateUrl: './bootstrap.component.html',
})
export class BootstrapComponent {
    // page snippets
    protected readonly snippets = {
        install,
        loadCss,
        use,
        forms,
        validation,
        customise,
        javascript,
    };
}
