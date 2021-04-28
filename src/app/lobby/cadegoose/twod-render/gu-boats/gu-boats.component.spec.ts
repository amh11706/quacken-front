import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuBoatsComponent } from './gu-boats.component';

describe('GuBoatsComponent', () => {
  let component: GuBoatsComponent;
  let fixture: ComponentFixture<GuBoatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuBoatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GuBoatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
