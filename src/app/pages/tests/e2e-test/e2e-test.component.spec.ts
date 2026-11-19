import { ComponentFixture, TestBed } from '@angular/core/testing';
import { E2eTestComponent } from './e2e-test.component';

describe('E2eTestComponent', () => {
  let component: E2eTestComponent;
  let fixture: ComponentFixture<E2eTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [E2eTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(E2eTestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
