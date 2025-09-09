import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedCount } from './bed-count';

describe('BedCount', () => {
  let component: BedCount;
  let fixture: ComponentFixture<BedCount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedCount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedCount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
