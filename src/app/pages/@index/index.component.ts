import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IndexLinkDirective, IndexSearch } from './index-link.directive';

// the tabs ('all' = every group)
const TABS = [
    'all',
    'template',
    'components',
    'forms',
    'application',
    'security',
    'theme',
    'dev',
    'tests',
] as const;
type Tab = (typeof TABS)[number];

@Component({
    imports: [RouterLink, IndexLinkDirective],
    providers: [IndexSearch], // one search per page
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrl: './index.component.css',
})
export class IndexComponent {
    protected readonly TABS = TABS;

    // ?tab= → input(): the back button keeps the tab
    readonly tab = input<string>();
    protected readonly current = computed<Tab>(() =>
        TABS.includes(this.tab() as Tab) ? (this.tab() as Tab) : 'all',
    );

    // search text (read by each link)
    protected readonly query = inject(IndexSearch).query;

    // while searching, every section shows
    protected show(tab: Tab): boolean {
        return this.query() !== '' || this.current() === 'all' || this.current() === tab;
    }
}
