import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-greeting',
  templateUrl: './greeting.component.html',
})
export class GreetingComponent {
  name = input.required<string>(); // from the parent
  greet = output<string>(); // to the parent

  sayHi() {
    this.greet.emit(`Hi ${this.name()}!`);
  }
}
