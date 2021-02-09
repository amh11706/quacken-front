import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassPromptComponent } from './pass-prompt.component';

describe('PassPromptComponent', () => {
  let component: PassPromptComponent;
  let fixture: ComponentFixture<PassPromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassPromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
