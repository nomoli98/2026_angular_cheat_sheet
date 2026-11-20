import { computed, Directive, ElementRef, inject, Injectable, signal } from '@angular/core';

// search text, one per index page (provided by IndexComponent)
@Injectable()
export class IndexSearch {
    readonly query = signal('');
}

// <a appIndexLink>: hidden unless its text or group title matches
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
