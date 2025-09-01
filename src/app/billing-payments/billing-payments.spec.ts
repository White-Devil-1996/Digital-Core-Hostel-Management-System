import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingPayments } from './billing-payments';

describe('BillingPayments', () => {
  let component: BillingPayments;
  let fixture: ComponentFixture<BillingPayments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingPayments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingPayments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
