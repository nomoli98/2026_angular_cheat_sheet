import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

// navbar switch (logic in ThemeService)
@Component({
    selector: 'app-theme-toggle',
    templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent {
    protected readonly theme = inject(ThemeService);
}
