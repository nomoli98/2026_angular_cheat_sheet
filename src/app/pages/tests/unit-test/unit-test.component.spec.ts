import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitTestComponent } from './unit-test.component';

describe('UnitTestComponent', () => {
  let component: UnitTestComponent;
  let fixture: ComponentFixture<UnitTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitTestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
