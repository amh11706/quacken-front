import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { getShipLink } from '../setting/setting.component';
import { SettingsService } from '../settings.service';
import { DBSetting, Setting } from '../types';

interface BaShipSetting extends DBSetting {
  data: {
    custom: number[],
    label?: string,
  }
}

// eslint-disable-next-line no-sparse-arrays
export const BoatTitles = [, , , , , , , , , , , , , ,
  'Sloop', 'Cutter', 'Dhow', 'Fanchuan', 'Longship', 'Baghlah', 'Merchant Brig', 'Junk',
  'War Brig', 'Merchant Galleon', 'Xebec', 'War Galleon', 'War Frigate', 'Grand Frigate', 'Black Ship',
];

export const ShipTypes = [
  { id: 27, name: BoatTitles[27], title: 'GF', cost: 50 },
  { id: 26, name: BoatTitles[26], title: 'WF', cost: 40 },
  { id: 25, name: BoatTitles[25], title: 'WG', cost: 30 },
  { id: 24, name: BoatTitles[24], title: 'Xb', cost: 30 },
  { id: 23, name: BoatTitles[23], title: 'MG', cost: 20 },
  { id: 22, name: BoatTitles[22], title: 'WB', cost: 25 },
  { id: 21, name: BoatTitles[21], title: 'Jk', cost: 15 },
  { id: 20, name: BoatTitles[20], title: 'MB', cost: 15 },
  { id: 19, name: BoatTitles[19], title: 'Bg', cost: 15 },
  { id: 18, name: BoatTitles[18], title: 'LS', cost: 10 },
  { id: 17, name: BoatTitles[17], title: 'Fc', cost: 7 },
  { id: 16, name: BoatTitles[16], title: 'Dh', cost: 7 },
  { id: 15, name: BoatTitles[15], title: 'Ct', cost: 7 },
  { id: 14, name: BoatTitles[14], title: 'Sl', cost: 5 },
];

@Component({
  selector: 'q-ba-ship-setting',
  templateUrl: './ba-ship-setting.html',
  styleUrls: ['./ba-ship-setting.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaShipSettingComponent {
  getShipLink = getShipLink;
  ShipTypes = ShipTypes;
  ShipTypeMap = new Map(ShipTypes.map(s => [s.id, s]));
  cost = 0;
  @Input() budget = 200;

  constructor(
    @Inject('setting') public setting: BaShipSetting,
    public ss: SettingsService,
  ) {
    if (!this.setting.data || !this.setting.data.custom) {
      this.setting.data = { custom: [] };
    }
    this.updateCost();
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

  shipLabel(id: number): string {
    const t = this.ShipTypeMap.get(id);
    return t ? `${t.title} (${t.cost})` : '';
  }

  private updateCost(): void {
    this.cost = this.setting.data.custom.reduce((sum, id) => sum + (this.ShipTypeMap.get(id)?.cost ?? 0), 0);
    if (this.cost > this.budget) {
      this.setting.data.custom.pop();
      this.updateCost();
    }
  }

  addCustom(id: number): void {
    this.setting.data.custom.push(id);
    this.updateCost();
    console.log(this.setting.data.custom);
  }

  removeCustom(i: number): void {
    this.setting.data.custom.splice(i, 1);
    this.updateCost();
    console.log(this.setting.data.custom);
  }
}
