```ts user.controller.ts
// core/controllers/user.controller.ts
// Rule: every CRUD method is ADMIN ONLY, except getMe()
@Service()
export class UserController {
  private readonly _userService = inject(UserService);
  private readonly _authService = inject(AuthService);

  async getAll(): Promise<UserResponse[]> {
    const user = this._authService.currentUser(); // 1. who is asking?
    if (!isAdmin(user)) deny(user);               // 2. not admin → throw (Promise rejected)
    return firstValueFrom(this._userService.getAll()); // 3. allowed → call the service
  }

  async getOne(id: number): Promise<UserResponse> {
    const user = this._authService.currentUser();
    if (!isAdmin(user)) deny(user);
    return firstValueFrom(this._userService.getOne(id));
  }

  // the ONLY one that isn't admin only: anybody logged in reads THEMSELVES
  async getMe(): Promise<UserResponse> {
    const user = this._authService.currentUser();
    if (!user) deny(user); // 'unauthorized'
    return firstValueFrom(this._userService.getOne(user.id)); // no id from outside
  }

  // create / updateFully / updatePartial / delete: same 3 lines as getOne
}
```

```ts user.controller.spec.ts
it('a user cannot delete an account, not even their own', async () => {
  currentUser.set(alice); // fake AuthService: a signal the test sets

  await expect(controller.delete(2)).rejects.toThrow('forbidden');
  expect(fakeUserService.delete).not.toHaveBeenCalled(); // nothing was sent
});

it('everything is unauthorized when nobody is logged in', async () => {
  await expect(controller.getOne(2)).rejects.toThrow('unauthorized');
});
```
