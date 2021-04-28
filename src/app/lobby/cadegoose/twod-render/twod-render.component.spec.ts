import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwodRenderComponent } from './twod-render.component';

describe('TwodRenderComponent', () => {
  let component: TwodRenderComponent;
  let fixture: ComponentFixture<TwodRenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwodRenderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwodRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
