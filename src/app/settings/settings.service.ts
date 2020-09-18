import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { InCmd, OutCmd } from '../ws-messages';

import { WsService } from '../ws.service';
import { Settings } from './setting/settings';

interface SettingsMessage {
  group: string;
  settings: Setting[];
}

export interface Setting {
  id: number;
  name: string;
  group: string;
  value: number;
}

export interface SettingMap {
  [key: string]: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settings = new Map<string, SettingMap>();
  private ready = new Map<string, Subject<SettingMap>>();

  open = false;
  admin = true;
  selected = 'lobby';
  lSettings: (keyof typeof Settings)[] = [];

  constructor(private ws: WsService) {
    ws.send(OutCmd.SettingGetGroup, 'global');
    ws.subscribe(InCmd.SettingSet, (s: Setting) => {
      const group = this.settings.get(s.group);
      if (group) group[s.name] = s.value;
    });
    ws.subscribe(InCmd.SettingsGet, (m: SettingsMessage) => {
      let group = this.settings.get(m.group);
      if (!group) {
        group = {};
        this.settings.set(m.group, group);
      }

      for (const setting of m.settings) group[setting.name] = setting.value;
      const ready = this.ready.get(m.group);
      if (ready) {
        ready.next(group);
        this.ready.delete(m.group);
      }
    });
    this.ws.connected$.subscribe(() => {
      this.settings.clear();
      this.open = false;
    });
  }

  setLobbySettings(names: (keyof typeof Settings)[]) {
    this.lSettings = names;
    if (names.length === 0) this.selected = 'global';
    else this.selected = 'lobby';
  }

  async getGroup(group: string, update = false): Promise<SettingMap> {
    if (!update) {
      const settings = this.settings.get(group);
      if (settings) return Promise.resolve(settings);
    }

    let ready = this.ready.get(group);
    const prom = new Promise<SettingMap>(resolve => {
      if (!ready) {
        ready = new Subject<SettingMap>();
        this.ready.set(group, ready);
        this.ws.send(OutCmd.SettingGetGroup, group);
      }
      ready.subscribe(v => resolve(v));
    });

    return prom;
  }

  async get(group: string, name: string): Promise<number> {
    const settings = await this.getGroup(group);
    return Promise.resolve(settings[name]);
  }

  async save(setting: Setting) {
    this.ws.send(OutCmd.SettingSet, setting);
    const settings = await this.getGroup(setting.group);
    settings[setting.name] = setting.value;
  }
}
