import { Component, input } from '@angular/core';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
})
export class UserComponent {
  // Filled by the router thanks to withComponentInputBinding() in app.config.ts
  id = input<string>(); // from the path:   /user/:id   → /user/42
  tab = input<string>(); // from the query: ?tab=posts
}
