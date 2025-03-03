import { ChangeDetectionStrategy, Component, Inject, Injector, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SettingsService } from '../settings.service';
import { DBSetting } from '../types';

@Component({
  selector: 'q-advanced',
  templateUrl: './advanced.component.html',
  styleUrls: ['./advanced.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AdvancedComponent {
  @Input() component: unknown;
  @Input() setting = {} as DBSetting;
  @Input() admin = true;
  customInjector: Injector;

  constructor(
    injector: Injector,
    @Inject(MAT_DIALOG_DATA) data: { component: unknown, setting: DBSetting, admin: boolean },
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
