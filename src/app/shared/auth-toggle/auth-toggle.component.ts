import { Component, inject } from '@angular/core';
import { RoleEnum } from '@core/enums/role.enum';
import { AuthToggleService } from './auth-toggle.service';

// The two switches in the navbar (logged in + admin). All the logic is in AuthToggleService.
@Component({
  selector: 'app-auth-toggle',
  templateUrl: './auth-toggle.component.html',
})
export class AuthToggleComponent {
  protected readonly toggle = inject(AuthToggleService);
  protected readonly RoleEnum = RoleEnum; // so the template can use the enum
}
