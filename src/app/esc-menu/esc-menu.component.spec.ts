import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscMenuComponent } from './esc-menu.component';

describe('EscMenuComponent', () => {
  let component: EscMenuComponent;
  let fixture: ComponentFixture<EscMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EscMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
