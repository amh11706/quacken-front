import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { SettingsService } from '../settings.service';
import { DBSetting, Setting } from '../types';
import { BoatTitles } from '../ship-list/ship-list.component';

interface BaShipSetting extends DBSetting {
  data: {
    custom: number[],
    label?: string,
  }
}

@Component({
  selector: 'q-ba-ship-setting',
  templateUrl: './ba-ship-setting.html',
  styleUrls: ['./ba-ship-setting.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaShipSettingComponent {
  constructor(
    @Inject('setting') public setting: BaShipSetting,
    public ss: SettingsService,
  ) {
    if (!this.setting.data || !this.setting.data.custom) {
      this.setting.data = { custom: [] };
    }
  }

  static setLabel(s: Setting): BaShipSetting['data'] | undefined {
    if (s.value === 0) return;
    const data: BaShipSetting['data'] = s.data ?? { custom: [] };
    if (!data.custom.length) {
      data.custom = [26, 26, 26, 26, 26];
    }
    data.custom.sort((a, b) => b - a);

    const shipTypeCounts = new Map<number, number>();
    for (const id of data.custom) {
      shipTypeCounts.set(id, (shipTypeCounts.get(id) ?? 0) + 1);
    }
    data.label = '"' + [...shipTypeCounts.entries()].map(([id, count]) => `${count}x ${BoatTitles[id]}`).join(', ') + '"';
    return data;
  }
}
