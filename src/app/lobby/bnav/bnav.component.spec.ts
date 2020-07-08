import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BnavComponent } from './bnav.component';

describe('BnavComponent', () => {
  let component: BnavComponent;
  let fixture: ComponentFixture<BnavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BnavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
