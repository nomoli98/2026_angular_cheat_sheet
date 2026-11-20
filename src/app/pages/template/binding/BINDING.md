# Binding in Angular 22

> 📖 **Official docs:** [Binding dynamic text, properties and attributes](https://angular.dev/guide/templates/binding) · [Event listeners](https://angular.dev/guide/templates/event-listeners) · [Two-way binding](https://angular.dev/guide/templates/two-way-binding) · [Component inputs](https://angular.dev/guide/components/inputs) · [Component outputs](https://angular.dev/guide/components/outputs)

How to get data **from the TS into the HTML**, **from the HTML back into the TS**, and **between a parent and a child component**.

Files: `static-binding/`, `responsive-binding/`, `event-binding/`, `two-way-binding/`, `child-component/`

---

## The four kinds of binding

| Syntax                 | Direction                    | Example                        | Demo                |
| ---------------------- | ---------------------------- | ------------------------------ | ------------------- |
| `{{ value }}`          | TS → HTML (text)             | `<p>{{ title() }}</p>`         | static-binding      |
| `[property]="value"`   | TS → HTML (property / input) | `<button [disabled]="busy()">` | static / responsive |
| `(event)="handler()"`  | HTML → TS                    | `<button (click)="save()">`    | event-binding       |
| `[(property)]="value"` | both ways                    | `<input [(ngModel)]="name" />` | two-way-binding     |

Easy way to remember: `[ ]` goes **into** the element, `( )` comes **out of** it, `[( )]` ("banana in a box") does both.

---

## 1. Interpolation `{{ }}`

```html
<p>This is the value I get from the .ts file : {{ value }}</p>
<p>{{ count() }}</p>
<!-- a signal: call it with () -->
<p>{{ price() * quantity() }}</p>
<!-- any simple expression -->
<p>{{ user()?.name ?? 'Anonymous' }}</p>
<!-- ?. and ?? work -->
```

It also works inside an attribute value. Angular turns it into a property binding:

```html
<img src="" alt="Profile photo of {{ firstName }}" />
```

Interpolation always gives a **string**. To pass a number, a boolean or an object, use `[property]`.

## 2. Property binding `[property]`

Sets a **DOM property** of a native element, or an **input** of a component.

```html
<!-- native properties -->
<input [placeholder]="inputPlaceholder" />
<button [disabled]="isDisabled">Disabled button</button>

<!-- component input (see section 7) -->
<app-child-component [value]="inputValue" />
```

```html
<button disabled="isDisabled">
    <!-- ❌ the STRING "isDisabled" -->
    <button [disabled]="isDisabled">
        <!-- ✅ the value of the field -->
        <app-child value="hello" />
        <!-- ✅ a plain string with no [] is fine -->
    </button>
</button>
```

## 3. Attribute binding `[attr.x]`

Some HTML attributes have **no matching DOM property**: `aria-*`, `role`, `colspan`, `data-*`. Use `attr.` for those:

```html
<p [attr.role]="pRole" [attr.aria-live]="live">Status: OK</p>
<td [attr.colspan]="span()"></td>
```

If the value is `null` or `undefined`, the attribute is **removed**.

## 4. Class and style binding

```html
<!-- one class, on/off -->
<p [class.underlined]="isUnderlined">Give a condition for a style class.</p>

<!-- several classes at once -->
<p [class]="listClasses">string: 'highlighted bold'</p>
<p [class]="['highlighted', 'bold']">array</p>
<p [class]="{ highlighted: isHighlighted(), bold: isBold() }">
    object: key = class, value = on/off
</p>

<!-- styles -->
<p [style.color]="color()"></p>
<p [style.width.px]="width()"></p>
<!-- the unit goes in the binding -->
<p [style.width]="'200px'"></p>
<!-- or in the value -->
<p [style]="{ color: color(), 'font-size.px': size() }"></p>
```

Static `class="..."` and bound `[class.x]` **mix fine** on the same element. You don't need `NgClass` / `NgStyle` any more.

⚠️ `[style.height]="200"` does nothing (no unit). Use `[style.height.px]="200"`. Angular 22.3+ warns you about this.

## 5. Plain fields vs signals (static vs responsive)

`static-binding` uses plain fields, `responsive-binding` uses signals.

```ts
// static: fine for values that never change
value = 'Readonly value';

// responsive: for values that change
value = signal('Initial value');
isDisabled = signal(false);
```

```html
<p>{{ value() }}</p>
<button (click)="value.set('Changed value')">Change value</button>
<button (click)="isDisabled.set(!isDisabled())">Toggle</button>
<button (click)="isDisabled.update((v) => !v)">Toggle (same thing)</button>
```

| Signal method                   | Use it to                                  |
| ------------------------------- | ------------------------------------------ |
| `mySignal()`                    | read the value                             |
| `mySignal.set(x)`               | replace the value                          |
| `mySignal.update((old) => ...)` | compute the new value from the old one     |
| `computed(() => a() + b())`     | make a read-only signal from other signals |

**Why it matters in Angular 22:** components are `OnPush` by default. A plain field changed by a `(click)` still shows up (the event triggers a check, like `clicked = !clicked` in `responsive-binding`). A plain field changed by a timer, an HTTP call or a `subscribe` **won't**. A signal always works. When in doubt, use a signal.

## 6. Event binding `(event)`

Any DOM event works: `click`, `input`, `change`, `keyup`, `keydown`, `submit`, `focus`, `blur`, `mouseover`... ([full list on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element#events))

```html
<!-- small logic directly in the template -->
<button (click)="value.set('New value')">Change value</button>

<!-- or call a method; $event is the native DOM event -->
<input (keyup)="showPressedKey($event)" />
```

```ts
protected showPressedKey(event: KeyboardEvent) {
  this.pressedKey.set(event.key);
}
```

### Handy shortcuts

```html
<input (keyup.enter)="search()" />
<!-- only on Enter -->
<input (keydown.control.s)="save($event)" />
<!-- key combos -->
<input (input)="name.set($any($event.target).value)" />
<!-- read an input's value -->
<button (click)="a(); b()">Two calls</button>
<!-- several statements with ; -->
```

### Template reference variables `#ref`

Get hold of an element without any TS:

```html
<input #box /> <button (click)="search(box.value)">Search</button>
```

## 7. Passing data to a child: `input()`

```ts
// child-component.component.ts
export class ChildComponentComponent {
    value = input.required<string>(); // must be given by the parent
    label = input('Default label'); // optional, with a default value
    size = input<number>(); // optional, number | undefined
}
```

```html
<!-- child-component.component.html -->
This is the passed value : {{ value() }}
```

```html
<!-- parent -->
<app-child-component [value]="inputValue" />
<app-child-component value="a plain string" />
```

- An input is a **read-only signal**: read it with `value()`, you can't `set()` it from the child.
- **Always give the type** (`input.required<string>()`), otherwise the value is `unknown`.
- Useful options:
    ```ts
    disabled = input(false, { transform: booleanAttribute }); // <app-x disabled /> = true
    width = input(0, { transform: numberAttribute }); // <app-x width="50" /> = 50
    userId = input.required<string>({ alias: 'id' }); // parent writes [id]="..."
    ```

## 8. Sending events to the parent: `output()`

```ts
// child
export class ItemComponent {
    deleted = output<number>(); // the type is what $event will be

    protected onDelete() {
        this.deleted.emit(42);
    }
}
```

```html
<!-- parent -->
<app-item (deleted)="removeItem($event)" />
<!-- $event = 42 -->
```

Name the output after **what happened** (`deleted`, `selected`, `closed`), not `onDelete`.

## 9. Two-way binding `[( )]`

`[(x)]="v"` is only a shortcut for `[x]="v" (xChange)="v = $event"`.

### On a native input: `ngModel`

Needs `FormsModule` in the component's `imports`.

```ts
imports: [FormsModule],
...
inputValue = '';
```

```html
<input type="text" [(ngModel)]="inputValue" />
<p>{{inputValue}}</p>
```

No signal needed! A signal works too: `[(ngModel)]="mySignal"` (no `()` inside the banana box).

For full forms, see [forms/FORM.md](../../forms/FORM.md).

### `model()` vs `signal()`

The demo page has the same counter twice, once with each:

```ts
modelCount = model<number>(0);
// model() makes count a two-way bindable input
updateCount(amount: number): void {
  this.modelCount.update((currentCount) => currentCount + amount);
}

signalCount = signal(0);
```

```html
<button (click)="updateCount(-1)">-</button>
<span> {{ modelCount() }} </span>
<button (click)="updateCount(+1)">+</button>

<button (click)="signalCount.set(signalCount()-1)">-</button>
<span> {{ signalCount() }} </span>
<button (click)="signalCount.set(signalCount()+1)">+</button>
```

**On this page, both counters behave exactly the same.** Inside its own component, a `model()` is just a writable signal: you read it with `()` and change it with `set()` / `update()`.

The difference is **who else can see it**:

|                                   | `signal()`                        | `model()`                                              |
| --------------------------------- | --------------------------------- | ------------------------------------------------------ |
| Read / write inside the component | ✅ `count()`, `set()`, `update()` | ✅ same                                                |
| A parent can give it a value      | ❌ private to the component       | ✅ it's an **input**: `<app-x [modelCount]="5" />`     |
| A parent hears when it changes    | ❌                                | ✅ it's also an **output**: `(modelCountChange)="..."` |
| Two-way with a parent             | ❌                                | ✅ `<app-x [(modelCount)]="parentSignal" />`           |

So `[(modelCount)]="parentSignal"` is the shortcut for `[modelCount]="parentSignal()" (modelCountChange)="parentSignal.set($event)"`, and the parent's signal and the child's model stay in sync.

**Which one to use:**

- The value only lives in this component → `signal()`.
- The value comes from a parent **and** the component changes it (a counter, a toggle, a date picker, a custom input) → `model()`.
- The value comes from a parent and the component only reads it → `input()`.

A routed page like this one has no parent template binding it, so here `modelCount` never receives or sends anything: `signal()` is enough. `model()` only shows its difference when the component is used as `<app-two-way-binding [(modelCount)]="..." />`.

Other `model()` details:

- The parent passes the **signal itself** (`[(count)]="parentCount"`), not its value (`parentCount()`).
- `model.required<T>()` exists too.

## 10. `input()` vs `output()` vs `model()`

|            | Parent → child | Child → parent | Child can change it | Parent writes            |
| ---------- | -------------- | -------------- | ------------------- | ------------------------ |
| `input()`  | ✅             |                | ❌                  | `[value]="x"`            |
| `output()` |                | ✅ (an event)  |                     | `(changed)="fn($event)"` |
| `model()`  | ✅             | ✅             | ✅                  | `[(count)]="mySignal"`   |

## Common mistakes

| Problem                                                        | Fix                                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Shows `[object Object]` or `function...`                       | You forgot the `()` on a signal: `{{ count() }}`                         |
| `Can't bind to 'ngModel'`                                      | Add `FormsModule` to `imports`                                           |
| `Can't bind to 'x' since it isn't a known property of 'app-y'` | Add the component to `imports`, or check the input name                  |
| The value changes in TS but not on screen                      | It's a plain field changed outside an event (OnPush): make it a `signal` |
| `[(ngModel)]="name()"` error                                   | No `()` inside the banana box: `[(ngModel)]="name"`                      |
| Child input is `unknown`                                       | Give it a type: `input.required<string>()`                               |
