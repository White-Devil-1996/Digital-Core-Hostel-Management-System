import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginModule } from './login-module';

describe('LoginModule', () => {
  let component: LoginModule;
  let fixture: ComponentFixture<LoginModule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginModule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
