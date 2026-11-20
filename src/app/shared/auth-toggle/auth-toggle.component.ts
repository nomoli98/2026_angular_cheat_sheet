import { Component, inject } from '@angular/core';
import { RoleEnum } from '@core/enums/role.enum';
import { AuthToggleService } from './auth-toggle.service';

// the 2 navbar switches (logic in AuthToggleService)
@Component({
    selector: 'app-auth-toggle',
    templateUrl: './auth-toggle.component.html',
})
export class AuthToggleComponent {
    protected readonly toggle = inject(AuthToggleService);
    protected readonly RoleEnum = RoleEnum; // for the template
}
