import { ChangeDetectionStrategy, Component, inject, ProviderToken } from '@angular/core';
import { SettingsService } from '../settings.service';
import { DBSetting, Setting } from '../types';
import { BoatTitles } from '../ship-list/ship-list.component';
import { OptionSetting, Settings } from '../setting/settings';

interface BaShipSetting extends DBSetting {
  data: {
    custom: number[],
    budget: number,
    label?: string,
  }
}

@Component({
  selector: 'q-ba-ship-setting',
  templateUrl: './ba-ship-setting.html',
  styleUrl: './ba-ship-setting.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class BaShipSettingComponent {
  setting = inject<BaShipSetting>('setting' as unknown as ProviderToken<BaShipSetting>);
  ss = inject(SettingsService);

  ShipSetting = Settings.baships as OptionSetting;

  constructor() {
    if (!this.setting.data || !this.setting.data.custom) {
      this.setting.data = { custom: [], budget: 200 };
    }
  }

  static setLabel(s: Setting): BaShipSetting['data'] | undefined {
    if (s.value === 0) return;

    const data = s.data as BaShipSetting['data'] ?? { custom: [], budget: 200 };
    if (s.value === 2) {
      if (s.data?.['budget'] === 1010) data.label = 'Influence cap: ∞';
      else data.label = 'Influence cap: ' + s.data?.['budget'];
      return data;
    }

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
