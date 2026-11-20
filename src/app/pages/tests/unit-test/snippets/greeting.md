```ts greeting.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GreetingComponent } from './greeting.component';

describe('GreetingComponent', () => {
  let fixture: ComponentFixture<GreetingComponent>;
  let html: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(GreetingComponent);
    html = fixture.nativeElement;

    // input.required: set it BEFORE whenStable
    fixture.componentRef.setInput('name', 'Bob');
    await fixture.whenStable();
  });

  it('shows the name it received', () => {
    expect(html.querySelector('p')?.textContent).toContain('Hello Bob');
  });

  it('updates when the input changes', async () => {
    fixture.componentRef.setInput('name', 'Alice');
    await fixture.whenStable();

    expect(html.querySelector('p')?.textContent).toContain('Hello Alice');
  });

  // output: listen with a spy
  it('emits a message when the button is clicked', () => {
    const spy = vi.fn(); // remembers its calls
    fixture.componentInstance.greet.subscribe(spy);

    html.querySelector('button')!.click();

    expect(spy).toHaveBeenCalledWith('Hi Bob!');
  });
});
```

```ts greeting.component.ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-greeting',
  templateUrl: './greeting.component.html',
})
export class GreetingComponent {
  name = input.required<string>(); // from the parent
  greet = output<string>(); // to the parent

  sayHi() {
    this.greet.emit(`Hi ${this.name()}!`);
  }
}
```

```html greeting.component.html
<p>Hello {{ name() }}</p>

<button (click)="sayHi()">Say hi</button>
```
