import { Component, Inject, Injector, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Setting, SettingsService } from '../settings.service';

@Component({
  selector: 'q-advanced',
  templateUrl: './advanced.component.html',
  styleUrls: ['./advanced.component.scss'],
})
export class AdvancedComponent {
  @Input() component: any;
  @Input() setting = {} as Setting;
  @Input() admin = true;
  customInjector: Injector;

  constructor(
    injector: Injector,
    @Inject(MAT_DIALOG_DATA) data: { component: any, setting: Setting, admin: boolean },
    public ss: SettingsService,
  ) {
    Object.assign(this, data);
    this.customInjector =
      Injector.create({
        providers: [
          { provide: 'setting', useValue: this.setting },
        ],
        parent: injector,
      });
  }
}
