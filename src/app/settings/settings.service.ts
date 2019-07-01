import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { WsService } from '../ws.service';

interface SettingsMessage {
  group: string,
  settings: Setting[],
}

export interface Setting {
  id: number,
  name: string,
  value: string,
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settings = new Map<string, Map<string, string>>();
  private ready = new Map<string, Subject<Map<string, string>>>();

  constructor(private ws: WsService) {
    ws.send('getSettings', 'global');
    ws.subscribe('getSettings', (m: SettingsMessage) => {
      let group = this.settings.get(m.group);
      if (!group) {
        group = new Map<string, string>();
        this.settings.set(m.group, group);
      }

      for (const setting of m.settings) group.set(setting.name, setting.value);
      const ready = this.ready.get(m.group);
      if (ready) {
        ready.next(group);
        this.ready.delete(m.group);
      }
    });
    this.ws.connected$.subscribe(() => {
      this.settings.clear();
    });
  }

  async getGroup(group: string): Promise<Map<string, string>> {
    const settings = this.settings.get(group);
    if (settings) return Promise.resolve(settings);

    let ready = this.ready.get(group);
    const prom = new Promise<Map<string, string>>(resolve => {
      if (!ready) {
        ready = new Subject<Map<string, string>>();
        this.ready.set(group, ready);
        this.ws.send('getSettings', group);
      }
      ready.subscribe(v => resolve(v));
    });

    return prom
  }

  async get(group: string, name: string): Promise<string> {
    const settings = await this.getGroup(group);
    return Promise.resolve(settings.get(name));
  }

  async save(setting: Setting) {
    this.ws.send('setSetting', setting);
  }
}
