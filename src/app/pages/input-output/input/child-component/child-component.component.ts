import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenderEnum } from '@core/enums/gender.enum';
import { RegisterRequest } from '@core/requests/register.request';

@Component({
  selector: 'app-child-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './child-component.component.html',
})
export class ChildComponentComponent {
  // required: the component can't work without it
  inputString = input.required<string>();

  // optional: default value
  inputUser = input<RegisterRequest>({
    name: 'Default',
    email: 'default@email.fake',
    password: '',
    birthdate: '',
    height: 50,
    gender: GenderEnum.OTHER,
    subscription: 'free',
    agreeToTerms: false,
  });
}
