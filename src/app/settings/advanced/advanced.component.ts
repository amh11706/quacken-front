import { ChangeDetectionStrategy, Component, Injector, Input, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SettingsService } from '../settings.service';
import { DBSetting } from '../types';

@Component({
  selector: 'q-advanced',
  templateUrl: './advanced.component.html',
  styleUrl: './advanced.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AdvancedComponent {
  ss = inject(SettingsService);

  @Input() component: unknown;
  @Input() setting = {} as DBSetting;
  @Input() admin = true;
  customInjector: Injector;

  constructor() {
    const injector = inject(Injector);
    const data = inject<{
    component: unknown;
    setting: DBSetting;
    admin: boolean;
}>(MAT_DIALOG_DATA);

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
