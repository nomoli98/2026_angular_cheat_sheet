```ts counter.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounterComponent } from './counter.component';

describe('CounterComponent', () => {
  let fixture: ComponentFixture<CounterComponent>;
  let component: CounterComponent; // the class (the .ts)
  let html: HTMLElement; // the rendered page (the .html)

  // Runs before EACH test, so every test starts with a fresh component
  beforeEach(async () => {
    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    html = fixture.nativeElement;
    await fixture.whenStable(); // wait for the HTML to be drawn
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts at 0', () => {
    expect(html.querySelector('p')?.textContent).toContain('Count: 0');
  });

  // Test the class directly: call a method, check the signal
  it('increment() adds 1', () => {
    component.increment();

    expect(component.count()).toBe(1);
  });

  // Test like a user: click the button, check the screen
  it('clicking +1 shows the new count', async () => {
    const button = html.querySelector('button') as HTMLButtonElement; // the first button

    button.click();
    await fixture.whenStable(); // ⚠️ let Angular update the HTML

    expect(html.querySelector('p')?.textContent).toContain('Count: 1');
  });

  it('reset() goes back to 0', () => {
    component.count.set(5);

    component.reset();

    expect(component.count()).toBe(0);
  });
});
```

```ts counter.component.ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
})
export class CounterComponent {
  count = signal(0);

  increment() {
    this.count.update((value) => value + 1);
  }

  reset() {
    this.count.set(0);
  }
}
```

```html counter.component.html
<p>Count: {{ count() }}</p>

<button (click)="increment()">+1</button>
<button (click)="reset()">Reset</button>
```
