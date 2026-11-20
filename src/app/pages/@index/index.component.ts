import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IndexLinkDirective, IndexSearch } from './index-link.directive';

// The tabs. 'all' = every group at once.
const TABS = ['all', 'basics', 'forms', 'application', 'tests'] as const;
type Tab = (typeof TABS)[number];

@Component({
  imports: [RouterLink, IndexLinkDirective],
  providers: [IndexSearch], // one search per index page, shared with its links
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
})
export class IndexComponent {
  protected readonly TABS = TABS;

  // ?tab=forms in the URL → this input (withComponentInputBinding in app.config.ts).
  // In the URL, so the browser "back" button brings you back to the same tab.
  readonly tab = input<string>();
  protected readonly current = computed<Tab>(() =>
    TABS.includes(this.tab() as Tab) ? (this.tab() as Tab) : 'all',
  );

  // What is typed in the search box (each link reads it, see index-link.directive.ts)
  protected readonly query = inject(IndexSearch).query;

  // Is this section visible? While searching, every section is (the search looks everywhere).
  protected show(tab: Tab): boolean {
    return this.query() !== '' || this.current() === 'all' || this.current() === tab;
  }
}
