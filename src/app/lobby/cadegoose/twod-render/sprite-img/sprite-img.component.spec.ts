import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpriteImgComponent } from './sprite-img.component';

describe('SpriteImgComponent', () => {
  let component: SpriteImgComponent;
  let fixture: ComponentFixture<SpriteImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpriteImgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpriteImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
