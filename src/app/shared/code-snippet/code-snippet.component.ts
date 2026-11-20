import { Component, computed, input, signal } from '@angular/core';
import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';

// Only register the languages we use, so the bundle stays small.
hljs.registerLanguage('html', xml);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);

interface SnippetTab {
  label: string;
  code: string;
  highlighted: string;
}

/**
 * Shows the code blocks of a snippet .md file as tabs, with a Copy button.
 *
 * The .md file contains fenced code blocks. The text after the language
 * becomes the tab name:
 *
 *   ```html condition.component.html
 *   ...
 *   ```
 *
 * Usage: <app-code-snippet [code]="snippets.ifElse" />
 */
@Component({
  selector: 'app-code-snippet',
  templateUrl: './code-snippet.component.html',
  styleUrl: './code-snippet.component.css',
})
export class CodeSnippetComponent {
  /** The content of a snippet .md file */
  code = input.required<string>();

  protected tabs = computed<SnippetTab[]>(() => {
    const blocks = this.code().matchAll(/```(\w+)[ \t]*([^\n]*)\n([\s\S]*?)```/g);
    return [...blocks].map(([, lang, label, code]) => ({
      label: label.trim() || lang.toUpperCase(),
      code: code.trimEnd(),
      highlighted: hljs.highlight(code.trimEnd(), { language: lang }).value,
    }));
  });

  protected activeIndex = signal(0);
  protected active = computed(() => this.tabs()[this.activeIndex()] ?? this.tabs()[0]);
  protected copied = signal(false);

  protected async copy() {
    await navigator.clipboard.writeText(this.active().code);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
