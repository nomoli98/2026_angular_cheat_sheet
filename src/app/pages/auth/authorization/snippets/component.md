```ts get-all.component.ts
export class GetAllComponent {
  private readonly _userController = inject(UserController);
  private readonly _authService = inject(AuthService);

  // re-computed every time currentUser() changes (login, logout, Admin toggle)
  protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));
  protected readonly _users = signal<UserResponse[]>([]);
  protected readonly _error = signal<string | null>(null);

  async onClick() {
    this._error.set(null);

    // 1. the component checks: not admin → no call at all
    if (!this._isAdmin()) {
      this._error.set('forbidden: only an admin can see the list of users');
      return;
    }

    try {
      // 2. the controller checks AGAIN (can't be skipped), then calls the service
      this._users.set(await this._userController.getAll());
    } catch (err) {
      this._error.set((err as Error).message); // 'unauthorized' / 'forbidden' / HTTP error
    }
  }
}
```

```html get-all.component.html
<!-- explain why -->
@if (!_isAdmin()) {
<div class="alert alert-warning">Only an admin can do this.</div>
}

<!-- can't click -->
<button (click)="onClick()" [disabled]="!_isAdmin()">Get All Users</button>

<!-- hide the data when the user stops being admin -->
@if (_isAdmin()) {
@for (u of _users(); track u.id) {
<li>{{ u.name }}</li>
}
}

<!-- 3 cases: admin / simple user / nobody -->
@if (_isAdmin()) {
<admin-panel />
} @else if (currentUser()) {
<p>You are a simple user.</p>
} @else {
<p>Log in first.</p>
}
```

```ts auth-toggle.service.ts
// shared/auth-toggle/auth-toggle.service.ts: the "Admin" switch in the navbar
const ACCOUNTS: Record<RoleEnum, LoginRequest> = {
  [RoleEnum.ADMIN]: { email: 'bob@email.bob', password: 'BobIsTheBest99#' },
  [RoleEnum.USER]: { email: 'alice.dupont@mail.com', password: 'AliceIsTheBest99#' },
};

async setRole(role: RoleEnum): Promise<void> {
  this._role.set(role);
  this._save('auth-role', role); // survives a refresh
  if (!this.isOn()) return;      // logged out: just remember it

  await firstValueFrom(this._auth.login(ACCOUNTS[role])); // a REAL login, as Bob or Alice
  // re-run the guards of the current page (adminGuard kicks Alice out)
  await this._router.navigateByUrl(this._router.url, { onSameUrlNavigation: 'reload' });
}
```
