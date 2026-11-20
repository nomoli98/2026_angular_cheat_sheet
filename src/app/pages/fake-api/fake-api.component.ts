import { Component } from '@angular/core';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import install from './snippets/install.md';
import db from './snippets/db.md';
import scripts from './snippets/scripts.md';
import angular from './snippets/angular.md';

@Component({
  imports: [CodeSnippetComponent],
  selector: 'app-fake-api',
  templateUrl: './fake-api.component.html',
})
export class FakeApiComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { install, db, scripts, angular };
}
