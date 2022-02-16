import { Component, Inject } from '@angular/core';
import { Settings, SliderSetting } from '../setting/settings';
import { Setting, SettingsService } from '../settings.service';

interface JobberSetting extends Setting {
  data: {
    Sail: number;
    Carp: number;
    Bilge: number;
    Maneuver: number;
  }
}

@Component({
  selector: 'q-jobber-quality',
  templateUrl: './jobber-quality.component.html',
  styleUrls: ['./jobber-quality.component.scss'],
})
export class JobberQualityComponent {
  JobberSetting = Settings.jobberQuality as SliderSetting;
  advanced = false;
  sliders: (keyof JobberSetting['data'])[] = ['Sail', 'Carp', 'Bilge', 'Maneuver'];

  constructor(
    @Inject('setting') public setting: JobberSetting,
    public ss: SettingsService,
  ) {
    if (!this.setting.data) this.setting.data = { Sail: 70, Carp: 70, Bilge: 70, Maneuver: 70 };
    this.advanced = this.setting.value > 100;
  }

  updateAdvanced(): void {
    this.setting.value = this.advanced ? 105 : 70;
  }
}
