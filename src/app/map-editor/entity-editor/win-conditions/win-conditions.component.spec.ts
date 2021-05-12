import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WinConditionsComponent } from './win-conditions.component';

describe('WinConditionsComponent', () => {
  let component: WinConditionsComponent;
  let fixture: ComponentFixture<WinConditionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WinConditionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
