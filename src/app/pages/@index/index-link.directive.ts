import { computed, Directive, ElementRef, inject, Injectable, signal } from '@angular/core';

// The search text, shared by the index page and all its links.
// Provided by IndexComponent (providers: [IndexSearch]), so each index page gets its own.
@Injectable()
export class IndexSearch {
  readonly query = signal('');
}

// Put it on a link: <a appIndexLink routerLink="...">Get Me</a>
// The link hides itself ([hidden]) when it doesn't match the search.
// It looks at its own text AND its group title, so 'auth' finds every link of the Auth group.
@Directive({
  selector: '[appIndexLink]',
  host: { '[hidden]': '!visible()' },
})
export class IndexLinkDirective {
  private readonly _search = inject(IndexSearch);
  private readonly _el: HTMLElement = inject(ElementRef).nativeElement; // this <a>

  protected readonly visible = computed(() => {
    const q = this._search.query().trim().toLowerCase();
    if (!q) return true;
    const group = this._el.closest('.index-group')?.querySelector('h4')?.textContent ?? '';
    return `${this._el.textContent} ${group}`.toLowerCase().includes(q);
  });
}
