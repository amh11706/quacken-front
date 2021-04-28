import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuBoatImgComponent } from './gu-boat-img.component';

describe('GuBoatImgComponent', () => {
  let component: GuBoatImgComponent;
  let fixture: ComponentFixture<GuBoatImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuBoatImgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GuBoatImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
