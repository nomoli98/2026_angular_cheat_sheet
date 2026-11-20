import { Component } from '@angular/core';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import install from './snippets/install.md';
import config from './snippets/config.md';
import ignore from './snippets/ignore.md';
import scripts from './snippets/scripts.md';
import result from './snippets/result.md';
import vscode from './snippets/vscode.md';

@Component({
    imports: [CodeSnippetComponent],
    selector: 'app-prettier',
    templateUrl: './prettier.component.html',
})
export class PrettierComponent {
    // page snippets
    protected readonly snippets = { install, config, ignore, scripts, result, vscode };
}
