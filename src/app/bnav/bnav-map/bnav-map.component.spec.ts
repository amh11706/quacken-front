import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BnavMapComponent } from './bnav-map.component';

describe('BnavMapComponent', () => {
  let component: BnavMapComponent;
  let fixture: ComponentFixture<BnavMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BnavMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BnavMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
