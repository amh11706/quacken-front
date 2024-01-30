import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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
        setting.value = s.value;
        setting.data = s.data;
      }
    });
  }

  setFakeSettings<T extends SettingGroup>(group: T, settings: ServerSettingMap<T>): void {
    const settingGroup = {} as SettingMap<T>;
    for (const [name, value] of Object.entries(settings)) {
      const n = name as ServerSettingGroup[T];
      settingGroup[n] = new Setting(
        { id: 0, name: n, group: group as SettingGroup, value: (value as DBSetting).value },
      );
    }
    this.settings.set(group, settingGroup);
  }

  setLobbySettings(adminNames: SettingList, showMapChoice = false, rankArea = 2): void {
    this.lAdminSettings = adminNames;
    this.showMapChoice = showMapChoice;
    this.rankArea = rankArea;
  }

  prefetch<T extends SettingGroup>(group: T): SettingMap<T> {
    const settings = this.settings.get(group);
    if (settings) return settings;

    const newSettings = {} as SettingMap<T>;
    for (const s of SettingValues) {
      if (s.group === group) {
        newSettings[s.name as ServerSettingGroup[T]] = new Setting(
          { id: s.id, name: s.name, group, value: s.default ?? 0 },
        );
      }
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
          const localSettings = this.prefetch(group);

          for (const setting of m) {
            const oldSetting = localSettings[setting.name];
            if (oldSetting) {
              oldSetting.data = setting.data;
              oldSetting.value = setting.value;
            } else localSettings[setting.name] = new Setting(setting);
          }
          resolve(localSettings);
        });
        this.ready.set(group, ready);
      });
    }
    return ready;
  }

  async get<T extends SettingGroup>(group: T, name: ServerSettingGroup[T]): Promise<Setting | undefined> {
    const settings = await this.getGroup(group);
    return Promise.resolve(settings[name]);
  }

  async save(setting: DBSetting): Promise<void> {
    this.ws.send(OutCmd.SettingSet, setting);
    const oldSetting = await this.get(setting.group, setting.name);
    if (oldSetting) {
      oldSetting.data = setting.data;
      oldSetting.value = setting.value;
    }
  }
}
