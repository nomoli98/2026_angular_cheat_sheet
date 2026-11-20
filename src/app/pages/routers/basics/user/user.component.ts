import { Component, input } from '@angular/core';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent {
  // set by the router (withComponentInputBinding)
  id = input<string>(); // /user/:id
  tab = input<string>(); // ?tab=posts
}
