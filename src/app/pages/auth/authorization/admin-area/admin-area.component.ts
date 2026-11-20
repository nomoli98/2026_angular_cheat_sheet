import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

// admins only (adminGuard)
@Component({
  imports: [RouterLink],
  selector: 'app-admin-area',
  templateUrl: './admin-area.component.html',
})
export class AdminAreaComponent {
  protected readonly auth = inject(AuthService);
}
