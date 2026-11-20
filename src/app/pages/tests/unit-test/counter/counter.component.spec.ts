import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounterComponent } from './counter.component';

describe('CounterComponent', () => {
  let fixture: ComponentFixture<CounterComponent>;
  let component: CounterComponent; // the class
  let html: HTMLElement; // the rendered HTML

  // before each test: a fresh component
  beforeEach(async () => {
    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    html = fixture.nativeElement;
    await fixture.whenStable(); // HTML drawn
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts at 0', () => {
    expect(html.querySelector('p')?.textContent).toContain('Count: 0');
  });

  // test the class
  it('increment() adds 1', () => {
    component.increment();

    expect(component.count()).toBe(1);
  });

  // test like a user
  it('clicking +1 shows the new count', async () => {
    const button = html.querySelector('button') as HTMLButtonElement; // first button

    button.click();
    await fixture.whenStable(); // ⚠️ let Angular update

    expect(html.querySelector('p')?.textContent).toContain('Count: 1');
  });

  it('reset() goes back to 0', () => {
    component.count.set(5);

    component.reset();

    expect(component.count()).toBe(0);
  });
});
