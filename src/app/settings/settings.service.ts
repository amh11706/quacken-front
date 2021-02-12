import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { InCmd, OutCmd } from '../ws-messages';

import { WsService } from '../ws.service';
import { Settings } from './setting/settings';

export interface Setting {
  id: number;
  name: string;
  group: string;
  value: number;
}

export interface SettingMap {
  [key: string]: number;
}

type SettingList = (keyof typeof Settings)[];

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settings = new Map<string, SettingMap>();
  private ready = new Map<string, Subject<SettingMap>>();

  open = false;
  tabIndex = 0;
  admin = true;
  lSettings: SettingList = [];
  lAdminSettings: SettingList = [];

  constructor(private ws: WsService) {
    ws.subscribe(InCmd.SettingSet, (s: Setting) => {
      const group = this.settings.get(s.group);
      if (group) group[s.name] = s.value;
    });

    this.ws.connected$.subscribe(v => {
      this.settings.clear();
      this.open = false;
      if (!v) return;
      this.getGroup('global');
    });
  }

  setLobbySettings(names: SettingList, adminNames: SettingList) {
    this.lSettings = names;
    this.lAdminSettings = adminNames;
    this.tabIndex = 0;
  }

  async getGroup(group: string, update = false): Promise<SettingMap> {
    if (!update) {
      const settings = this.settings.get(group);
      if (settings) return Promise.resolve(settings);
    }

    let ready = this.ready.get(group);
    if (!ready) {
      ready = new Subject<SettingMap>();
      this.ready.set(group, ready);

      this.ws.request(OutCmd.SettingGetGroup, group).then((m: Setting[]) => {
        let localSettings = this.settings.get(group);
        if (!localSettings) {
          localSettings = {};
          this.settings.set(group, localSettings);
        }

        for (const setting of m) localSettings[setting.name] = setting.value;
        ready?.next(localSettings);
        this.ready.delete(group);
      });
    }
    return new Promise<SettingMap>(async (resolve) => {
      ready?.subscribe(v => resolve(v));
    });
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
