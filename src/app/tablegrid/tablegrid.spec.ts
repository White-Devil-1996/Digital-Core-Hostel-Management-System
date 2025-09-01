import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tablegrid } from './tablegrid';

describe('Tablegrid', () => {
  let component: Tablegrid;
  let fixture: ComponentFixture<Tablegrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tablegrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tablegrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
