import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

// The "Dark mode" switch in the navbar. All the logic is in ThemeService.
@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
}
