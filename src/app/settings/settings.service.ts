import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { InCmd, OutCmd } from '../ws/ws-messages';

import { WsService } from '../ws/ws.service';
import { ServerSettingGroup, SettingGroup, SettingName, SettingValues } from './setting/settings';
import { DBSetting, SettingMap, Setting, ServerSettingMap } from './types';

export type SettingList = SettingName[];

interface LocalSettings extends Map<SettingGroup, SettingMap<SettingGroup>> {
  get<T extends SettingGroup>(group: T): SettingMap<T> | undefined;
  set<T extends SettingGroup>(group: T, settings: SettingMap<T>): this;
}

interface LocalSettingsReady extends Map<SettingGroup, Promise<SettingMap<SettingGroup>>> {
  get<T extends SettingGroup>(group: T): Promise<SettingMap<T>>;
  set<T extends SettingGroup>(group: T, subject: Promise<SettingMap<T>>): this;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settings: LocalSettings = new Map();
  private ready: LocalSettingsReady = new Map();

  tabIndex = 1;
  admin$ = new BehaviorSubject(true);
  lAdminSettings: SettingList = [];
  showMapChoice = false;
  rankArea = 2;

  constructor(private ws: WsService) {
    ws.subscribe(InCmd.SettingSet, s => {
      const group = this.settings.get(s.group);
      const setting = group?.[s.name];
      if (setting) {
        setting.data = s.data;
        setting.setServerValue(s.value);
      }
    });
  }

  setFakeSettings<T extends SettingGroup>(group: T, settings: ServerSettingMap<T>): void {
    const settingGroup = this.prefetch(group);
    for (const [name, value] of Object.entries<DBSetting>(settings)) {
      const s = settingGroup[name as ServerSettingGroup[T]];
      if (!s) continue;
      s.data = value.data;
      s.setServerValue(value.value);
    }
    this.settings.set(group, settingGroup);
  }

  setLobbySettings(adminNames: SettingList, showMapChoice = false, rankArea = 2): void {
    this.lAdminSettings = adminNames;
    this.showMapChoice = showMapChoice;
    this.rankArea = rankArea;
  }

  prefetch<T extends SettingGroup>(group: T, clean = false): SettingMap<T> {
    const settings = this.settings.get(group);
    if (settings && !clean) return settings;

    const newSettings = settings || {} as SettingMap<T>;
    for (const s of SettingValues) {
      if (s.group !== group) continue;
      const key = s.name as ServerSettingGroup[T];
      const oldSetting = newSettings[key];
      if (oldSetting) {
        oldSetting.data = null;
        oldSetting.setServerValue(0);
        continue;
      }

      const setting = new Setting(this, s);
      newSettings[key] = setting;
      setting.userStream.pipe(debounceTime(500)).subscribe(() => {
        this.save(setting.toDBSetting());
      });
    }
    this.settings.set(group, newSettings);
    return newSettings;
  }

  getGroup<T extends SettingGroup>(group: T, update = false): Promise<SettingMap<T>> {
    let ready = this.ready.get(group);
    if (!ready || update) {
      ready = new Promise(resolve => {
        void this.ws.request(OutCmd.SettingGetGroup, group).then(mu => {
          if (!mu) return;
          const m = mu as DBSetting<T>[];
          const localSettings = this.prefetch(group, update);

          for (const setting of m) {
            const oldSetting = localSettings[setting.name];
            if (oldSetting) {
              oldSetting.data = setting.data;
              oldSetting.setServerValue(setting.value);
            }
          }
          resolve(localSettings);
        });
      });
      this.ready.set(group, ready);
    }
    return ready;
  }

  async get<T extends SettingGroup>(group: T, name: ServerSettingGroup[T]): Promise<Setting> {
    const settings = await this.getGroup(group);
    return Promise.resolve(settings[name]);
  }

  save(setting: DBSetting): void {
    this.ws.send(OutCmd.SettingSet, setting);
  }
}
