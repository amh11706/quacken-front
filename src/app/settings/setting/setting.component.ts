import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { WsService } from '../../ws/ws.service';
import { AdvancedComponent } from '../advanced/advanced.component';
import { SettingsService } from '../settings.service';

import { SettingInput, Settings } from './settings';
import { SettingMap, SettingPartial } from '../types';

export const links: Record<number, string> = {
  14: 'smsloop/smsloop',
  15: 'lgsloop/lgsloop',
  16: 'dhow/dhow',
  17: 'fanchuan/fanchuan',
  18: 'longship/longship',
  19: 'baghlah/baghlah',
  20: 'merchbrig/merchbrig',
  21: 'junk/junk',
  22: 'warbrig/warbrig',
  23: 'merchgal/merchgal',
  24: 'xebec/xebec',
  25: 'wargal/wargal',
  26: 'warfrig/warfrig',
  27: 'grandfrig/grandfrig',
  28: 'blackship/blackship',
};

export function getShipLink(id: number): string {
  return `/assets/boats/${links[id] || 'boat' + id}.png`;
}

@Component({
  selector: 'q-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})

export class SettingComponent {
  @Input() set name(value: keyof typeof Settings) {
    this.setting = Settings[value] || {};
    void this.fetch();
  }

  @Output() valueChange = new EventEmitter<number>();

  setting = {} as SettingInput;
  group: SettingMap = {};
  settingValue = {} as SettingPartial;
  getShipLink = getShipLink;
  private debounce?: number;

  constructor(public ss: SettingsService, private ws: WsService, private dialog: MatDialog) { }

  private async fetch() {
    this.group[this.setting.name] = { value: 0 };
    if (this.setting.group) this.group = await this.ss.getGroup(this.setting.group);
    this.settingValue = this.group[this.setting.name] ?? this.settingValue;
  }

  openAdvanced(): void {
    const copy: SettingPartial = JSON.parse(JSON.stringify(this.settingValue));
    this.dialog.open(AdvancedComponent, {
      data: {
        component: this.setting.advancedComponent,
        setting: copy,
        admin: this.setting.admin,
      },
    }).afterClosed().subscribe((value: string) => {
      if (value !== 'true') return;
      // only assign the value if the user clicked save.
      Object.assign(this.settingValue, copy);
      this.save();
    });
  }

  private setLabel(): void {
    let label = '';
    switch (this.setting.type) {
      case 'checkbox':
        label = this.settingValue.value ? 'true' : 'false';
        break;
      case 'option':
        label = this.setting.options[this.settingValue.value] || '';
        break;
      case 'slider':
        if (this.setting.setLabel) return this.setting.setLabel(this.settingValue);
        label = this.setting.stepLabels?.[this.settingValue.value] || '';
        break;
      default:
        return;
    }

    if (this.setting.advancedComponent) {
      if (typeof this.settingValue.data !== 'object' || !this.settingValue.data) this.settingValue.data = {};
      this.settingValue.data.label = label ? '"' + label + '"' : undefined;
    } else this.settingValue.data = label || undefined;
  }

  send(): void {
    if (this.setting.type !== 'button') return;
    if (!this.setting.trigger) return;
    this.ws.send(this.setting.trigger, this.setting.data);
  }

  save(): void {
    const newSetting = this.settingValue;
    if (this.setting.type === 'slider') {
      if (newSetting.value > this.setting.max) newSetting.value = this.setting.max;
      else if (newSetting.value < this.setting.min) newSetting.value = this.setting.min;
    }
    this.setLabel();

    clearTimeout(this.debounce);
    this.debounce = window.setTimeout(() => {
      this.valueChange.emit(+newSetting.value);
      void this.ss.save({
        id: this.setting.id,
        name: this.setting.name,
        title: this.setting.label || this.setting.name,
        value: +newSetting.value,
        group: this.setting.group,
        data: newSetting.data,
      });
      if (this.setting.trigger) {
        this.ws.send(this.setting.trigger, +newSetting.value);
      }
    }, 750);
  }
}
