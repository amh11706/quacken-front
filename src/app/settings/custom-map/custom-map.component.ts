import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { SettingPartial } from '../settings.service';
import { WsService } from '../../../app/ws.service';
import { CustomMapSetting } from '../setting/settings';

@Component({
  selector: 'q-custom-map',
  templateUrl: './custom-map.component.html',
  styleUrls: ['./custom-map.component.scss'],
})
export class CustomMapComponent implements OnInit {
  @Input() settingValue?: SettingPartial;
  @Input() setting!: CustomMapSetting;
  @Input() disabled = false;
  @Output() save = new EventEmitter();

  data: { id: number, name: string, label: string, username: string }[] = [];
  loading = true;

  constructor(private ws: WsService) { }

  async ngOnInit(): Promise<void> {
    if (!this.setting) console.error('CustomMapComponent requires setting input');
    const m = await this.ws.request(this.setting.cmd);
    for (const i of m) i.label = i.name + ' (' + i.username + ')';
    this.data = m;
    this.loading = false;
  }

  preSave(): void {
    const setting = this.settingValue;
    if (!setting) return;
    const selected = this.data.find(el => el.id === +setting.value);
    setting.data = selected?.label || 'Random';
    this.save.emit();
  }
}
