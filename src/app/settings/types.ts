import { BehaviorSubject, Observable } from 'rxjs';
import { ServerSettingGroup, SettingGroup, SettingName, Settings } from './setting/settings';

export interface DBSetting<T extends SettingGroup = SettingGroup> {
  id: number;
  name: ServerSettingGroup[T];
  title?: string;
  group: T;
  value: number;
  data?: any;
  stream?: never;
}

export class Setting {
  readonly id: number;
  readonly name: ServerSettingGroup[SettingGroup];
  readonly group: SettingGroup;
  private _stream: BehaviorSubject<number>;
  readonly stream: Observable<number>;

  constructor(setting: DBSetting);
  constructor(setting: SettingName, value: number, data?: any);
  constructor(setting: SettingName | DBSetting, value?: number, public data?: any) {
    if (typeof setting === 'object') {
      this.id = setting.id;
      this.name = setting.name;
      this.group = setting.group;
      this.data = setting.data;
      this._stream = new BehaviorSubject(setting.value);
    } else {
      const s = Settings[setting];
      this.id = s.id;
      this.name = s.name;
      this.group = s.group;
      this._stream = new BehaviorSubject(value ?? 0);
    }
    this.stream = this._stream.asObservable();
  }

  get value(): number {
    return this._stream.value;
  }

  set value(value: number) {
    this._stream.next(value);
  }

  clone(): Setting {
    return new Setting(this.toDBSetting());
  }

  toDBSetting(): DBSetting {
    return {
      id: this.id,
      name: this.name,
      group: this.group,
      value: this.value,
      data: { ...this.data },
    };
  }
}

export type SettingMap<T extends SettingGroup> = {
  [key in ServerSettingGroup[T]]: Setting;
};

export type ServerSettingMap<T extends SettingGroup = SettingGroup> = {
  [K in ServerSettingGroup[T]]: DBSetting<T>;
}
