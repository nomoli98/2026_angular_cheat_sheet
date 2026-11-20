import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { compare, hash } from 'bcryptjs';
import { environment } from '@env/environment';
import { UserEntity } from '@core/entities/user.entity';
import { CodeSnippetComponent } from '@shared/code-snippet/code-snippet.component';
import hashSnippet from './snippets/hash.md';
import compareSnippet from './snippets/compare.md';

interface HashResult {
  value: string;
  ms: number;
}

@Component({
  imports: [CodeSnippetComponent, RouterLink],
  selector: 'app-bcrypt-explain',
  templateUrl: './explain.component.html',
})
export class BcryptExplainComponent {
  // The code shown on the page (see the snippets/ folder)
  protected readonly snippets = { hash: hashSnippet, compare: compareSnippet };

  private readonly _http = inject(HttpClient);

  // 1. Hash it
  protected readonly ROUNDS = [4, 8, 10, 12];
  protected readonly _password = signal('BobIsTheBest99#');
  protected readonly _rounds = signal(10);
  protected readonly _hashes = signal<HashResult[]>([]); // newest first
  protected readonly _busy = signal(false);

  async onHash() {
    this._busy.set(true);
    const start = performance.now();
    const value = await hash(this._password(), this._rounds());
    const ms = Math.round(performance.now() - start);
    this._hashes.update((list) => [{ value, ms }, ...list].slice(0, 3));
    this._checkHash.set(value); // ready for section 2
    this._busy.set(false);
  }

  // '$2b$10$' + 22 chars of salt + 31 chars of hash
  protected parts(value: string) {
    return {
      algo: value.slice(0, 4), // $2b$
      cost: value.slice(4, 7), // 10$
      salt: value.slice(7, 29),
      hash: value.slice(29),
    };
  }

  // 2. Check it
  protected readonly _checkPassword = signal('BobIsTheBest99#');
  protected readonly _checkHash = signal(
    '$2b$10$xScyLRoTzCndQZvGgrzwquFPmyRK0V9fja7/TukOT1j7IXedYJMRS', // Bob in db.seed.json
  );
  protected readonly _match = signal<{ ok: boolean; ms: number } | null>(null);

  async onCompare() {
    const start = performance.now();
    try {
      const ok = await compare(this._checkPassword(), this._checkHash());
      this._match.set({ ok, ms: Math.round(performance.now() - start) });
    } catch {
      this._match.set({ ok: false, ms: 0 }); // not a bcrypt hash at all
    }
  }

  // 3. What db.json stores (DEMO: reads json-server directly, password included)
  protected readonly _stored = signal<{ plain: string; hashed: string } | null>(null);

  async onShowStored() {
    const params = { email: 'bob@email.bob' };
    const [[plain], [hashed]] = await Promise.all([
      firstValueFrom(this._http.get<UserEntity[]>(`${environment.apiUrl}/people`, { params })),
      firstValueFrom(
        this._http.get<UserEntity[]>(`${environment.apiUrl}/securePeople`, { params }),
      ),
    ]);
    this._stored.set({ plain: plain?.password ?? '?', hashed: hashed?.password ?? '?' });
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
