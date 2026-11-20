```ts get-all.component.ts
export class GetAllComponent {
    private readonly _userController = inject(UserController);
    private readonly _authService = inject(AuthService);

    // re-runs on user change
    protected readonly _isAdmin = computed(() => isAdmin(this._authService.currentUser()));
    protected readonly _users = signal<UserResponse[]>([]);
    protected readonly _error = signal<string | null>(null);

    async onClick() {
        this._error.set(null);

        // 1. component check
        if (!this._isAdmin()) {
            this._error.set('forbidden: only an admin can see the list of users');
            return;
        }

        try {
            // 2. controller checks again
            this._users.set(await this._userController.getAll());
        } catch (err) {
            this._error.set((err as Error).message); // 'unauthorized' / 'forbidden'
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

<!-- hide when not admin -->
@if (_isAdmin()) { @for (u of _users(); track u.id) {
<li>{{ u.name }}</li>
} }

<!-- admin / user / nobody -->
@if (_isAdmin()) {
<admin-panel />
} @else if (currentUser()) {
<p>You are a simple user.</p>
} @else {
<p>Log in first.</p>
}
```

```ts auth-toggle.service.ts
// shared/auth-toggle/auth-toggle.service.ts
const ACCOUNTS: Record<RoleEnum, LoginRequest> = {
  [RoleEnum.ADMIN]: { email: 'bob@email.bob', password: 'BobIsTheBest99#' },
  [RoleEnum.USER]: { email: 'alice.dupont@mail.com', password: 'AliceIsTheBest99#' },
};

async setRole(role: RoleEnum): Promise<void> {
  this._role.set(role);
  this._save('auth-role', role); // saved
  if (!this.isOn()) return; // logged out: remember

  await firstValueFrom(this._auth.login(ACCOUNTS[role])); // real login
  // re-run guards
  await this._router.navigateByUrl(this._router.url, { onSameUrlNavigation: 'reload' });
}
```
