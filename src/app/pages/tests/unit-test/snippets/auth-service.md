```ts auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { initialRegisterData } from '../factories/register.factory';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    // Ask Angular for the service, like inject() does in a component
    service = TestBed.inject(AuthService);
  });

  it('logs in with the right email and password', () => {
    const result = service.login('bob@email.bob', 'BobIsTheBest99#');

    expect(result).toBe(true);
    expect(service.currentUser()?.name).toBe('Bob');
  });

  it('refuses a wrong password', () => {
    const result = service.login('bob@email.bob', 'wrong');

    expect(result).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('can log in after registering', () => {
    const alice = { ...initialRegisterData(), name: 'Alice', email: 'alice@mail.com', password: '1234' };

    service.register(alice);

    expect(service.login('alice@mail.com', '1234')).toBe(true);
  });

  it('refuses to register the same email twice', () => {
    const copyOfBob = { ...initialRegisterData(), email: 'bob@email.bob' };

    expect(service.register(copyOfBob)).toBe(false);
  });

  it('logs out', () => {
    service.login('bob@email.bob', 'BobIsTheBest99#');

    service.logout();

    expect(service.currentUser()).toBeNull();
  });
});
```

```ts auth.service.ts
import { Injectable, signal } from '@angular/core';
import { RegisterData } from '../models/user.interface';
import { GenderEnum } from '../enums/gender.enum';

/**
 * A very basic fake login / register service, used by the test examples.
 * ⚠️ No server, no token, no real security: the users live in a list in memory
 * and are gone when you refresh the page.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Our fake "database". Bob is already registered so you can log in right away.
  private readonly users: RegisterData[] = [
    {
      name: 'Bob',
      email: 'bob@email.bob',
      password: 'BobIsTheBest99#',
      birthdate: '2000-09-22',
      height: 195,
      gender: GenderEnum.MALE,
      subscription: 'premium',
      agreeToTerms: true,
    },
  ];

  // The user who is logged in, or null if nobody is.
  readonly currentUser = signal<RegisterData | null>(null);

  /** Adds a user. Returns false if the email is already taken. */
  register(user: RegisterData): boolean {
    if (this.users.some((u) => u.email === user.email)) {
      return false;
    }
    this.users.push(user);
    return true;
  }

  /** Returns true and remembers the user if the email + password match. */
  login(email: string, password: string): boolean {
    const user = this.users.find((u) => u.email === email && u.password === password);
    this.currentUser.set(user ?? null);
    return user !== undefined;
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
```
