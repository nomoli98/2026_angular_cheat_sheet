# Signal Inputs (`input()`), Parent → Child

> 📖 **Official docs:** [Accepting data with input properties](https://angular.dev/guide/components/inputs)

How to pass data from a parent component to a child component with signal inputs.

---

## 1. Child component: declare the inputs

```ts
import { Component, input } from '@angular/core';
import { GenderEnum } from '@core/enums/gender.enum';
import { RegisterRequest } from '@core/requests/register.request';

@Component({
  selector: 'app-child-component',
  standalone: true,
  templateUrl: './child-component.component.html',
})
export class ChildComponentComponent {
  // REQUIRED: the parent MUST pass it, or the build fails.
  inputString = input.required<string>();

  // OPTIONAL: if the parent passes nothing, the default value is used.
  inputUser = input<RegisterRequest>({
    name: 'Default',
    email: 'default@email.fake',
    password: '',
    birthdate: '',            // empty string = no date yet
    height: 50,
    gender: GenderEnum.OTHER,
    subscription: 'free',
    agreeToTerms: false,
  });
}
```

### Which one should I use?

| Syntax                         | Parent must pass it? | Value if nothing passed |
| ------------------------------ | -------------------- | ----------------------- |
| `input.required<T>()`          | ✅ Yes                | build error             |
| `input<T>(defaultValue)`       | ❌ No                 | `defaultValue`          |
| `input<T>()`                   | ❌ No                 | `undefined` (type `T \| undefined`) |

Rule of thumb: use `required` if the component can't work without the value. Otherwise give a default value.

---

## 2. Child template: read the input

Inputs are **signals**, so you **call them with `()`**:

```html
<h3>Child component:</h3>

<p>This is the string you passed: {{ inputString() }}</p>

<p>And this is the user:</p>
<ul>
  <li>{{ inputUser().name }}</li>
  <li>{{ inputUser().email }}</li>
  <li>{{ inputUser().subscription }}</li>
</ul>
```

> ❌ `{{ inputUser.name }}` → doesn't work
> ✅ `{{ inputUser().name }}`

---

## 3. Parent component: import the child + create the data

```ts
import { Component, signal } from '@angular/core';
import { GenderEnum } from '@core/enums/gender.enum';
import { RegisterRequest } from '@core/requests/register.request';
import { ChildComponentComponent } from './child-component/child-component.component';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ChildComponentComponent],   // 👈 DON'T FORGET THIS
  templateUrl: './input.component.html',
})
export class InputComponent {
  String = signal<string>('Parent given value');

  User = signal<RegisterRequest>({
    name: 'Bob',
    email: 'bob@email.bob',
    password: 'BobIsTheBest99#',
    birthdate: '2000-09-22',   // ⚠️ 'YYYY-MM-DD' string, see gotchas
    height: 195,
    gender: GenderEnum.MALE,
    subscription: 'premium',
    agreeToTerms: true,
  });
}
```

---

## 4. Parent template: pass the values

Use `[inputName]="value"` (square brackets = property binding):

```html
<h2>Parent component</h2>

<!-- Both inputs -->
<app-child-component [inputString]="String()" [inputUser]="User()" />

<!-- Only the required one → inputUser uses its default value -->
<app-child-component [inputString]="String()" />

<!-- Plain static string: no brackets needed -->
<app-child-component inputString="Hello" />
```

---

## 5. Bonus options

### Rename the input for the parent (alias)

```ts
inputUser = input<RegisterRequest>(defaultUser, { alias: 'user' });
```
```html
<app-child-component [user]="User()" />
```

### Transform the value as it comes in

```ts
import { booleanAttribute, numberAttribute } from '@angular/core';

disabled = input(false, { transform: booleanAttribute }); // <x disabled /> → true
size     = input(0,     { transform: numberAttribute });  // size="12" → 12
```

### Derive a value from an input

```ts
import { computed } from '@angular/core';

userLabel = computed(() => `${this.inputUser().name} (${this.inputUser().subscription})`);
```

---

## 🐛 Troubleshooting

### `NG8002: Can't bind to 'xxx' since it isn't a known property of 'app-yyy'`

Check in this order:

1. **Is the child in the parent's `imports: []`?** (most common cause)
2. **Is the input name spelled the same** in the child `.ts` and in the parent `.html`? (case-sensitive)
3. **Is the child file saved?** (dot on the VS Code tab = unsaved → *File → Save All*)
4. **Restart `ng serve`** (Ctrl+C, then run it again). The watcher sometimes misses changes.
5. **Clear the Angular cache:**
   ```bash
   # PowerShell
   Remove-Item -Recurse -Force .angular\cache
   # bash
   rm -rf .angular/cache
   ```
6. **Duplicate component?** Ctrl+click the class name in the parent's import to make sure it opens the right file.

> 💡 Hint: if only ONE input fails and the others work, the compiler is reading an old version of the child (go to steps 3 → 5).

### `NG0950: Input is required but no value is available yet`

You read an `input.required()` in the **constructor**. Read it in the template, in `computed()`, `effect()`, or `ngOnInit` instead.

### Birthdate format: always `'YYYY-MM-DD'`

`birthdate` is a **string** in `RegisterRequest` (`core/requests/register.request.ts`), in the same format `<input type="date">` uses.

```ts
birthdate: '2000-09-22';   // ✅
birthdate: '22/09/2000';   // ❌ the date input shows it empty, the validators reject it
```

Need a real `Date` (to compute an age, for example)? Split the string. Don't use `new Date('2000-09-22')`: it reads the date as UTC midnight, which can be the day before in your timezone.

```ts
const [y, m, d] = user.birthdate.split('-').map(Number);
const date = new Date(y, m - 1, d);   // month starts at 0
```

### `Type 'null' is not assignable to type 'string'`

You wrote `birthdate: null`. Use an empty string for "no date yet":

```ts
birthdate: '',
```
