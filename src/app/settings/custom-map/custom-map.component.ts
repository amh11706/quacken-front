import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { SettingMap } from '../settings.service';
import { WsService } from '../../../app/ws.service';

@Component({
  selector: 'q-custom-map',
  templateUrl: './custom-map.component.html',
  styleUrls: ['./custom-map.component.scss'],
})
export class CustomMapComponent implements OnInit {
  @Input() group?: SettingMap;
  @Input() setting: any;
  @Input() disabled = false;
  @Output() save = new EventEmitter();

  data: { id: number, name: string, label: string, username: string }[] = [];
  loading = true;

  constructor(private ws: WsService) { }

  async ngOnInit(): Promise<void> {
    const m = await this.ws.request(this.setting.cmd);
    for (const i of m) i.label = i.name + ' (' + i.username + ')';
    this.data = m;
    this.loading = false;
  }

  preSave(): void {
    const setting = this.group?.[this.setting.name];
    if (!setting) return;
    const selected = this.data.find(el => el.id === +setting.value);
    setting.data = selected?.label || 'Random';
    this.save.emit();
  }
}
