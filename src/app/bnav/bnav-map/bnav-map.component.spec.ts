import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BnavMapComponent } from './bnav-map.component';

describe('BnavMapComponent', () => {
  let component: BnavMapComponent;
  let fixture: ComponentFixture<BnavMapComponent>;

  beforeEach(async(() => {
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
