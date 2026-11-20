import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthToggleComponent } from '@shared/auth-toggle/auth-toggle.component';
import { ThemeToggleComponent } from '@shared/theme-toggle/theme-toggle.component';

@Component({
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        AuthToggleComponent,
        ThemeToggleComponent,
    ],
    selector: 'app-root',
    styleUrl: './app.css',
    templateUrl: './app.html',
})
export class App {
    protected readonly title = signal('angular-cheat-sheet');
}
