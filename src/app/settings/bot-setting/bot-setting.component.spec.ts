import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotSettingComponent } from './bot-setting.component';

describe('BotSettingComponent', () => {
  let component: BotSettingComponent;
  let fixture: ComponentFixture<BotSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BotSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BotSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
