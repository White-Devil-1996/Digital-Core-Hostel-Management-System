import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Customeronboard } from './customeronboard';

describe('Customeronboard', () => {
  let component: Customeronboard;
  let fixture: ComponentFixture<Customeronboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Customeronboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Customeronboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
