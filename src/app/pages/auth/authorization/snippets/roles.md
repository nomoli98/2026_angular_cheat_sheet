```ts role.enum.ts
// core/enums/role.enum.ts
export enum RoleEnum {
  ADMIN = 'admin',
  USER = 'user',
}

// The role is a field of the user: UserEntity, UserResponse and db.json
// { "id": 1, "name": "Bob Martin", ..., "role": "admin" }
```

```ts permissions.ts
// core/controllers/permissions.ts
// Tiny helpers: the rules live in ONE place, controllers / pages / guards all use them
type WithRole = Pick<UserResponse, 'id' | 'role'>;

export function isAdmin(user: WithRole | null): boolean {
  return user?.role === RoleEnum.ADMIN; // null (logged out) → false
}

// "you can only touch your own data" (not used by UserController: everything is admin only)
export function isAdminOrSelf(user: WithRole | null, id: number): boolean {
  return isAdmin(user) || user?.id === id;
}

// Throws the right error, like an API:
// nobody logged in → 'unauthorized' (401), logged in but not allowed → 'forbidden' (403)
export function deny(user: WithRole | null): never {
  throw new Error(user ? 'forbidden' : 'unauthorized');
}
```

```ts new rule
// Need another rule? Add a helper, use it in the controller
export function isPremium(user: UserResponse | null): boolean {
  return user?.subscription === SubscriptionEnum.PREMIUM;
}
```
