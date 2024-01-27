import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { WsService } from '../../ws/ws.service';
import { CustomMapSetting } from '../setting/settings';
import { SettingPartial } from '../types';
import { OutCmd } from '../../ws/ws-messages';
import { MapOption } from '../map-list/map-card/types';

interface DropdownMapOption extends MapOption {
  label: string;
}

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

  data: DropdownMapOption[] = [];
  loading = true;

  constructor(private ws: WsService) { }

  async ngOnInit(): Promise<void> {
    if (!this.setting) console.error('CustomMapComponent requires setting input');
    const m = await this.ws.request(OutCmd.MapList) as DropdownMapOption[] | undefined;
    if (!m) return;
    for (const i of m) i.label = i.name + ' (' + i.username + ')';
    this.data = m;
    this.loading = false;
  }

  preSave(): void {
    const setting = this.settingValue;
    if (!setting) return;
    const selected = this.data.find(el => el.id === +setting.value);
    setting.data = selected?.label || 'Generated';
    this.save.emit();
  }
}
