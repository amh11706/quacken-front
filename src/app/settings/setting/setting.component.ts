import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SettingsService, SettingMap } from '../settings.service';
import { WsService } from 'src/app/ws.service';

import { Settings } from './settings';

@Component({
  selector: 'q-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent {
  @Input() set name(value: keyof typeof Settings) {
    this.setting = Settings[value] || {};
    this.setting.name = this.setting.name || value;
    this.fetch();
  }
  @Output() change = new EventEmitter<number>();

  setting: any = {};
  group: SettingMap = {};
  private debounce?: number;

  constructor(public ss: SettingsService, private ws: WsService) { }

  private async fetch() {
    this.group[this.setting.name] = { value: 0 };
    if (this.setting.group) this.group = await this.ss.getGroup(this.setting.group);
  }

  send() {
    this.ws.send(this.setting.trigger, this.setting.data);
  }

  save() {
    if (typeof this.setting.max === 'number') {
      if (this.group[this.setting.name] > this.setting.max) this.group[this.setting.name] = this.setting.max;
      else if (this.group[this.setting.name] < this.setting.min) this.group[this.setting.name] = this.setting.min;
    }

    clearTimeout(this.debounce);
    this.debounce = window.setTimeout(() => {
      const v = +this.group[this.setting.name].value;
      this.change.emit(v);
      this.ss.save({
        id: this.setting.id,
        name: this.setting.name,
        value: v,
        group: this.setting.group,
      });
      if (this.setting.trigger) this.ws.send(this.setting.trigger, +this.group[this.setting.name]);
    }, 750);
  }

}
