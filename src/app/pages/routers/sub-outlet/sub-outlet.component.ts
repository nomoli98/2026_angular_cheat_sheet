import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import unnamedOutlet from './snippets/unnamed-outlet.md';
import namedOutlet from './snippets/named-outlet.md';

@Component({
    selector: 'app-sub-outlet',
    imports: [CodeSnippetComponent, RouterOutlet, RouterLink],
    templateUrl: './sub-outlet.component.html',
})
export class SubOutletComponent {
    // page snippets
    protected readonly snippets = { unnamedOutlet, namedOutlet };

    private router = inject(Router);
    private route = inject(ActivatedRoute); // /router/sub-outlet

    openPanel() {
        this.router.navigate([{ outlets: { panel: ['3'] } }], { relativeTo: this.route });
    }

    closePanel() {
        this.router.navigate([{ outlets: { panel: null } }], { relativeTo: this.route });
    }
}
