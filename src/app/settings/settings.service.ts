import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { WsService } from '../ws.service';

interface SettingsMessage {
  group: string,
  settings: Setting[],
}

export interface Setting {
  id: number,
  name?: string,
  group?: string,
  value: number,
}

export interface SettingMap {
  [key: string]: number,
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
  lSettings: string[] = [];

  constructor(private ws: WsService) {
    ws.send('getSettings', 'global');
    ws.subscribe('setSetting', (s: Setting) => {
      const group = this.settings.get(s.group);
      if (group) group[s.name] = s.value;
    });
    ws.subscribe('joinLobby', () => {
      this.settings.delete('l/quacken');
    });
    ws.subscribe('lobbyList', () => {
      this.settings.delete('l/quacken');
    });
    ws.subscribe('getSettings', (m: SettingsMessage) => {
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

  setLobbySettings(names: string[]) {
    this.lSettings = names;
    if (names.length === 0) this.selected = 'global';
    else this.selected = 'lobby';
  }

  async getGroup(group: string): Promise<SettingMap> {
    const settings = this.settings.get(group);
    if (settings) return Promise.resolve(settings);

    let ready = this.ready.get(group);
    const prom = new Promise<SettingMap>(resolve => {
      if (!ready) {
        ready = new Subject<SettingMap>();
        this.ready.set(group, ready);
        this.ws.send('getSettings', group);
      }
      ready.subscribe(v => resolve(v));
    });

    return prom
  }

  async get(group: string, name: string): Promise<number> {
    const settings = await this.getGroup(group);
    return Promise.resolve(settings[name]);
  }

  async save(setting: Setting) {
    this.ws.send('setSetting', setting);
    const settings = await this.getGroup(setting.group);
    settings[setting.name] = setting.value;
  }
}
