# Signal Outputs (`output()`), Child → Parent

> 📖 **Official docs:** [Custom events with outputs](https://angular.dev/guide/components/outputs)

How a child component sends data (an "event") back up to its parent with `output()`.

```
Parent ──[input]──▶ Child      (see INPUT.md)
Parent ◀──(output)── Child     (this file)
```

---

## 1. Child component: declare the output and emit

```ts
import { Component, output } from '@angular/core';

@Component({
    selector: 'app-child-component',
    templateUrl: './child-component.component.html',
})
export class ChildComponentComponent {
    // Declares an event called "outputValue" that carries a string.
    outputValue = output<string>();

    onClick() {
        // Sends the value to whoever is listening.
        this.outputValue.emit('Boom!🧨💥💥');
    }
}
```

- `output<T>()` → `T` is the type of the value you send.
- `.emit(value)` → sends it. The value must match `T`, or you get a TypeScript error.
- Outputs are **not** signals: you never call `outputValue()`. You only `.emit()`.

---

## 2. Child template: trigger the emit

```html
<button class="big-red-button" (click)="onClick()">Big red button</button>
```

Anything can trigger the emit: a click, a form submit, a timer, an `effect()`...

---

## 3. Parent component: import the child + handle the value

```ts
import { Component, signal } from '@angular/core';
import { ChildComponentComponent } from './child-component/child-component.component';

@Component({
    selector: 'app-output',
    imports: [ChildComponentComponent], // 👈 DON'T FORGET THIS
    templateUrl: './output.component.html',
})
export class OutputComponent {
    output = signal<string>('');

    // Receives the emitted value.
    onClick(value: string) {
        this.output.set(value);
    }
}
```

> 💡 The signal is called `output` here. That works (the `output()` function is only imported in the child), but a name like `message` is easier to read.

---

## 4. Parent template: listen to the output

Use `(outputName)="handler($event)"` (round brackets = event binding):

```html
<app-child-component (outputValue)="onClick($event)" />
<p>{{ output() }}</p>
```

- `$event` **is the value passed to `.emit()`**, here the string `"Boom!🧨💥💥"`.
- Round brackets `( )` for outputs, square brackets `[ ]` for inputs.

### Shortcut: no handler method

For simple cases, set the signal directly in the template:

```html
<app-child-component (outputValue)="output.set($event)" />
```

---

## 5. Bonus options

### Output with no value (`void`)

```ts
closed = output<void>();
// or just: closed = output();

close() {
  this.closed.emit();
}
```

```html
<app-dialog (closed)="isOpen.set(false)" />
```

### Emit an object

```ts
saved = output<{ id: number; name: string }>();

save() {
  this.saved.emit({ id: 1, name: 'Bob' });
}
```

```html
<app-child-component (saved)="onSaved($event)" />
```

```ts
onSaved(user: { id: number; name: string }) {
  console.log(user.name);
}
```

### Rename the output for the parent (alias)

```ts
outputValue = output<string>({ alias: 'boom' });
```

```html
<app-child-component (boom)="onClick($event)" />
```

### Turn an Observable into an output (RxJS)

```ts
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

tick = outputFromObservable(interval(1000)); // emits 0, 1, 2... every second
```

### Listen to a child's output in TypeScript (not the template)

```ts
import { Component, viewChild, effect } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';

child = viewChild.required(ChildComponentComponent);

constructor() {
  effect(() => {
    // Option A: subscribe directly (auto-cleaned when the child is destroyed)
    this.child().outputValue.subscribe((value) => console.log(value));

    // Option B: as an Observable, to use RxJS operators
    // outputToObservable(this.child().outputValue).pipe(...).subscribe(...);
  });
}
```

Use the template `(event)` syntax whenever you can. This is only for special cases.

---

## 6. `model()`: input + output together (two-way binding)

When the parent gives a value **and** the child can change it, use `model()` instead of an `input()` + an `output()`.

### Child

```ts
import { Component, model } from '@angular/core';

@Component({
    selector: 'app-counter',
    template: `
        <button (click)="count.update((c) => c - 1)">-</button>
        {{ count() }}
        <button (click)="count.update((c) => c + 1)">+</button>
    `,
})
export class CounterComponent {
    count = model(0); // or model.required<number>()
}
```

### Parent

```html
<!-- Banana in a box [( )] = two-way -->
<app-counter [(count)]="total" />
<p>Total: {{ total() }}</p>
```

```ts
total = signal(5);
```

When the child calls `count.set()` / `count.update()`, the parent's `total` signal updates too.

### What `model()` does for you

`model()` creates an input called `count` **and** an output called `countChange`. So these two lines do the same thing:

```html
<app-counter [(count)]="total" />
<app-counter [count]="total()" (countChange)="total.set($event)" />
```

> ⚠️ For `[(count)]="total"`, pass the signal **without** `()`. With `()` you pass a plain value, and the parent never gets updated.

### Which one should I use?

| Need                                                           | Use        |
| -------------------------------------------------------------- | ---------- |
| Parent → child only                                            | `input()`  |
| Child → parent only (an event: click, save, close...)          | `output()` |
| Same value goes both ways (counter, toggle, custom form field) | `model()`  |

More on two-way binding: [BINDING.md](../../template/binding/BINDING.md).

---

## 🐛 Troubleshooting

### Nothing happens when I click (no error)

Angular does **not** complain about a misspelled output name. It just listens to a DOM event that never fires. Check:

1. The name in the parent's `( )` is **exactly** the property name in the child (case-sensitive): `(outputValue)`, not `(outputvalue)` or `(output-value)`.
2. If you used an `alias`, the parent must use the **alias**, not the property name.
3. The child really calls `.emit()` (add a `console.log` in `onClick()`).
4. You used **round** brackets `(outputValue)`, not square ones `[outputValue]`.

### `NG8001: 'app-child-component' is not a known element`

The child is missing from the parent's `imports: []`.

### `Argument of type 'string' is not assignable to parameter of type 'number'`

`$event` has the type you gave to `output<T>()`. The handler's parameter must use the same type:

```ts
outputValue = output<string>();   // child
onClick(value: string) { ... }    // parent ✅ same type
```

### `this.outputValue is not a function`

You wrote `this.outputValue('...')`. Outputs aren't signals, so use `this.outputValue.emit('...')`.

### `NG0953: Unexpected emit for destroyed OutputRef`

The child emitted after it was destroyed (e.g. from a `setTimeout` or a subscription). Cancel timers and subscriptions when the component is destroyed (`DestroyRef` / `takeUntilDestroyed()`).

### Still stuck?

Same steps as in [INPUT.md](../input/INPUT.md#-troubleshooting): save all files, restart `ng serve`, clear `.angular/cache`.
