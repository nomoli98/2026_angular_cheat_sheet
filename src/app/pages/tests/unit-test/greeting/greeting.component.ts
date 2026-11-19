import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-greeting',
  templateUrl: './greeting.component.html',
})
export class GreetingComponent {
  name = input.required<string>(); // the parent gives it
  greet = output<string>(); // we send it back to the parent

  sayHi() {
    this.greet.emit(`Hi ${this.name()}!`);
  }
}
