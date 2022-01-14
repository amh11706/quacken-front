import { Component, Inject } from '@angular/core';
import { TeamColorsCss } from '../../lobby/cadegoose/cade-entry-status/cade-entry-status.component';
import { getShipLink } from '../setting/setting.component';
import { Settings } from '../setting/settings';
import { Setting, SettingsService } from '../settings.service';

interface BotSetting extends Setting {
  data: {
    padExtra: number[],
    custom: number[][],
  }
}

@Component({
  selector: 'q-bot-setting',
  templateUrl: './bot-setting.component.html',
  styleUrls: ['./bot-setting.component.scss'],
})
export class BotSettingComponent {
  BotSetting = Settings.enableBots;
  Ships = Settings.nextCadeBoat;
  getShipLink = getShipLink;
  TeamColors = TeamColorsCss;

  constructor(
    @Inject('setting') public setting: BotSetting,
    @Inject('save') public save: () => void,
    public ss: SettingsService,
  ) {
    if (!this.setting.data) this.setting.data = { padExtra: [], custom: [[], [], [], []] };
  }

  addPadExtra(): void {
    const padExtra = this.setting.data.padExtra;
    padExtra.push(padExtra[padExtra.length - 1] || 26);
  }

  removePadExtra(i: number): void {
    this.setting.data.padExtra.splice(i, 1);
  }

  addCustom(team: number[]): void {
    team.push(team[team.length - 1] || 26);
  }

  removeCustom(team: number[], i: number): void {
    team.splice(i, 1);
  }
}
