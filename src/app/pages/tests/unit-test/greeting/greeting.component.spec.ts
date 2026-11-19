import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GreetingComponent } from './greeting.component';

describe('GreetingComponent', () => {
  let fixture: ComponentFixture<GreetingComponent>;
  let html: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(GreetingComponent);
    html = fixture.nativeElement;

    // INPUT: play the parent and give a value to name
    // (it's input.required, so do it BEFORE whenStable or you get NG0950)
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

  // OUTPUT: listen to it like the parent would, with a "spy" function
  it('emits a message when the button is clicked', () => {
    const spy = vi.fn(); // a fake function that remembers how it was called
    fixture.componentInstance.greet.subscribe(spy);

    html.querySelector('button')!.click();

    expect(spy).toHaveBeenCalledWith('Hi Bob!');
  });
});
