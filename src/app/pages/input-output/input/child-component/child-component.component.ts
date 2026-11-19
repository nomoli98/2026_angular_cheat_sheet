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
  // if the input is ABSOLUTELY necessary to make the component work add required.
  inputString = input.required<string>();

  //Otherwise, you can leave the required out and give a default value, to fill the gaps in case there is no user passed to the component.
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
