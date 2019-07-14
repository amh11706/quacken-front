import { Component, Input } from '@angular/core';

import { SettingsService, SettingMap } from '../settings.service';
import { WsService } from 'src/app/ws.service';

import { Settings } from './settings';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent {
  @Input() set name(value: string) {
    this.setting = Settings[value] || {};
    this.setting.name = value;
    if (this.setting) this.fetch(value);
  }

  setting: any = {};
  group: SettingMap = {};
  private debounce: number;

  constructor(private ss: SettingsService, private ws: WsService) { }

  ngOnDestroy() {
  }

  private async fetch(name: string) {
    this.setting.name = name;
    this.group = await this.ss.getGroup(this.setting.group);
  }

  save() {
    if (typeof this.setting.max === 'number') {
      if (this.group[this.setting.name] > this.setting.max) this.group[this.setting.name] = this.setting.max;
      else if (this.group[this.setting.name] < this.setting.min) this.group[this.setting.name] = this.setting.min;
    }

    clearTimeout(this.debounce);
    this.debounce = window.setTimeout(() => {
      this.ss.save({
        id: this.setting.id,
        name: this.setting.name,
        value: +this.group[this.setting.name]
      }, this.setting.group);
      if (this.setting.trigger) this.ws.send(this.setting.trigger, +this.group[this.setting.name]);
    }, 500);
  }

}
