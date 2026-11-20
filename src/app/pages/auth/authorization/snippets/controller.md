```ts user.controller.ts
// core/controllers/user.controller.ts
// all admin only, except getMe()
@Service()
export class UserController {
    private readonly _userService = inject(UserService);
    private readonly _authService = inject(AuthService);

    async getAll(): Promise<UserResponse[]> {
        const user = this._authService.currentUser(); // 1. who?
        if (!isAdmin(user)) deny(user); // 2. allowed?
        return firstValueFrom(this._userService.getAll()); // 3. call the service
    }

    async getOne(id: number): Promise<UserResponse> {
        const user = this._authService.currentUser();
        if (!isAdmin(user)) deny(user);
        return firstValueFrom(this._userService.getOne(id));
    }

    // anybody logged in
    async getMe(): Promise<UserResponse> {
        const user = this._authService.currentUser();
        if (!user) deny(user); // 'unauthorized'
        return firstValueFrom(this._userService.getOne(user.id)); // own id only
    }

    // create / update / delete: same as getOne
}
```

```ts user.controller.spec.ts
it('a user cannot delete an account, not even their own', async () => {
    currentUser.set(alice); // fake AuthService

    await expect(controller.delete(2)).rejects.toThrow('forbidden');
    expect(fakeUserService.delete).not.toHaveBeenCalled(); // nothing sent
});

it('everything is unauthorized when nobody is logged in', async () => {
    await expect(controller.getOne(2)).rejects.toThrow('unauthorized');
});
```
