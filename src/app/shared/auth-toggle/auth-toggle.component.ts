import { Component, inject } from '@angular/core';
import { AuthToggleService } from './auth-toggle.service';

// The switch in the navbar. All the logic is in AuthToggleService.
@Component({
  selector: 'app-auth-toggle',
  templateUrl: './auth-toggle.component.html',
})
export class AuthToggleComponent {
  protected readonly toggle = inject(AuthToggleService);
}
