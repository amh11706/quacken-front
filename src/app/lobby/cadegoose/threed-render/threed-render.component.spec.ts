import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreedRenderComponent } from './threed-render.component';

describe('ThreedRenderComponent', () => {
  let component: ThreedRenderComponent;
  let fixture: ComponentFixture<ThreedRenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreedRenderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreedRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
