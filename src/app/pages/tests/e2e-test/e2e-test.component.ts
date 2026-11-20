import { Component } from '@angular/core';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import { LoginFormComponent } from '../unit-test/login-form/login-form.component';
import setup from './snippets/setup.md';
import config from './snippets/config.md';
import tests from './snippets/tests.md';
import run from './snippets/run.md';

@Component({
  imports: [CodeSnippetComponent, LoginFormComponent],
  selector: 'app-e2e-test',
  templateUrl: './e2e-test.component.html',
})
export class E2eTestComponent {
  // page snippets
  protected readonly snippets = { setup, config, tests, run };
}
