import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenderEnum } from '@core/enums/gender.enum';
import { ChildComponentComponent } from './child-component/child-component.component';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import inputCode from './snippets/input.md';
import { RegisterRequest } from '@core/requests/register.request';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CodeSnippetComponent, CommonModule, ChildComponentComponent],
  templateUrl: './input.component.html',
})
export class InputComponent {
  // page snippets
  protected readonly snippets = { inputCode };

  String = signal<string>('Parent given value');

  User = signal<RegisterRequest>({
    name: 'Bob',
    email: 'bob@email.bob',
    password: 'BobIsTheBest99#',
    birthdate: '2000-09-22',
    height: 195,
    gender: GenderEnum.MALE,
    subscription: 'premium',
    agreeToTerms: true,
  });
}
