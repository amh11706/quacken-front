import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Settings, SliderSetting } from '../setting/settings';
import { SettingsService } from '../settings.service';
import { DBSetting } from '../types';

interface JobberSetting extends DBSetting {
  data: {
    Sail: number;
    Carp: number;
    Bilge: number;
    Cannon: number;
    Maneuver: number;
  }
}

@Component({
  selector: 'q-jobber-quality',
  templateUrl: './jobber-quality.component.html',
  styleUrl: './jobber-quality.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class JobberQualityComponent {
  setting = inject<JobberSetting>('setting' as any);
  ss = inject(SettingsService);

  JobberSetting = Settings.jobberQuality as SliderSetting;
  advanced = false;
  sliders: (keyof JobberSetting['data'])[] = ['Sail', 'Carp', 'Bilge', 'Cannon', 'Maneuver'];

  constructor() {
    if (!this.setting.data || typeof this.setting.data.Sail === 'undefined') {
      this.setting.data = { Sail: 70, Carp: 70, Bilge: 70, Cannon: 70, Maneuver: 70 };
    }
    this.advanced = this.setting.value > 100;
  }

  updateAdvanced(): void {
    this.setting.value = this.advanced ? 105 : 70;
  }
}
