```ts role.enum.ts
// core/enums/role.enum.ts
export enum RoleEnum {
  ADMIN = 'admin',
  USER = 'user',
}

// db.json: { ..., "role": "admin" }
```

```ts permissions.ts
// core/controllers/permissions.ts
// rules in ONE place
type WithRole = Pick<UserResponse, 'id' | 'role'>;

export function isAdmin(user: WithRole | null): boolean {
  return user?.role === RoleEnum.ADMIN; // null → false
}

// own data only (example)
export function isAdminOrSelf(user: WithRole | null, id: number): boolean {
  return isAdmin(user) || user?.id === id;
}

// 'unauthorized' (401) / 'forbidden' (403)
export function deny(user: WithRole | null): never {
  throw new Error(user ? 'forbidden' : 'unauthorized');
}
```

```ts new rule
// new rule = new helper
export function isPremium(user: UserResponse | null): boolean {
  return user?.subscription === SubscriptionEnum.PREMIUM;
}
```
