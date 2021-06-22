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
  data?: any;
}

export interface SettingPartial {
  value: number;
  data?: any;
}

export interface SettingMap {
  [key: string]: SettingPartial;
}

type SettingList = (keyof typeof Settings)[];

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settings = new Map<string, SettingMap>();
  private ready = new Map<string, Subject<SettingMap>>();

  tabIndex = 1;
  admin = true;
  lAdminSettings: SettingList = [];
  showMapChoice = false;

  constructor(private ws: WsService) {
    ws.subscribe(InCmd.SettingSet, (s: Setting) => {
      const group = this.settings.get(s.group);
      if (group && group[s.name]) group[s.name].value = s.value;
    });

    ws.connected$.subscribe(v => {
      if (!v) return;
      this.settings.clear();
    });
  }

  setFakeSettings(group: string, settings: SettingMap): void {
    this.settings.set(group, settings);
  }

  setLobbySettings(adminNames: SettingList, showMapChoice = false): void {
    this.lAdminSettings = adminNames;
    this.showMapChoice = showMapChoice;
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

        for (const setting of m) localSettings[setting.name] = setting;
        ready?.next(localSettings);
        this.ready.delete(group);
      });
    }
    return new Promise<SettingMap>(resolve => {
      ready?.subscribe(v => resolve(v));
    });
  }

  async get(group: string, name: string): Promise<SettingPartial> {
    const settings = await this.getGroup(group);
    return Promise.resolve(settings[name]);
  }

  async save(setting: Setting): Promise<void> {
    this.ws.send(OutCmd.SettingSet, setting);
    const oldSetting = await this.get(setting.group, setting.name);
    Object.assign(oldSetting, setting);
  }
}
