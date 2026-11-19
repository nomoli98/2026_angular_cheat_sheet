import { Component, signal } from '@angular/core';
import { CodeSnippetComponent } from '../../../../../../angular-22-cheat-sheet/src/app/shared/code-snippet/code-snippet.component';
import { CounterComponent } from './counter/counter.component';
import { GreetingComponent } from './greeting/greeting.component';
import { LoginFormComponent } from './login-form/login-form.component';
import run from './snippets/run.md';
import counter from './snippets/counter.md';
import greeting from './snippets/greeting.md';
import authService from './snippets/auth-service.md';
import loginForm from './snippets/login-form.md';

@Component({
  imports: [CodeSnippetComponent, CounterComponent, GreetingComponent, LoginFormComponent],
  selector: 'app-unit-test',
  templateUrl: './unit-test.component.html',
})
export class UnitTestComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { run, counter, greeting, authService, loginForm };

  lastGreeting = signal('');
}
