import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ServerSettingGroup, SettingGroup, SettingInput, SettingName, Settings } from './setting/settings';
import { SettingsService } from './settings.service';

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
  readonly inputConfig: SettingInput;
  private _userStream = new Subject<number>();
  readonly userStream = this._userStream.asObservable();
  private _stream: BehaviorSubject<number>;
  readonly stream: Observable<number>;

  constructor(private ss: SettingsService, setting: SettingName | SettingInput, value?: number, public data?: any) {
    if (typeof setting === 'string') {
      setting = Settings[setting];
    }
    this.inputConfig = setting;
    this._stream = new BehaviorSubject(value ?? setting.default ?? 0);
    this.data = data;
    this.stream = this._stream.asObservable();
  }

  get value(): number {
    return this._stream.getValue();
  }

  set value(value: number) {
    this._stream.next(this.clampValue(value));
    this._userStream.next(this.value);
  }

  setServerValue(value: number): void {
    this._stream.next(value);
  }

  cloneData(): any {
    return typeof this.data === 'object' ? { ...this.data } : this.data;
  }

  emit(): void {
    this._userStream.next(this.value);
  }

  clone(): Setting {
    return new Setting(this.ss, this.inputConfig, this.value, { ...this.data });
  }

  toDBSetting(): DBSetting {
    return {
      id: this.inputConfig.id,
      name: this.inputConfig.name,
      group: this.inputConfig.group,
      title: this.inputConfig.label || this.inputConfig.name,
      value: this.value,
      data: this.setLabel(this.cloneData()),
    };
  }

  private setLabel(data: unknown): string | { label: string } | unknown {
    let label: string | undefined;
    switch (this.inputConfig.type) {
      case 'checkbox':
        label = this.value ? 'true' : 'false';
        break;
      case 'option':
        label = this.inputConfig.options[this.value];
        break;
      case 'slider':
        if (this.inputConfig.setLabel) return this.inputConfig.setLabel(this);
        label = this.inputConfig.stepLabels?.[this.value];
        break;
      default:
        return data;
    }

    if (this.inputConfig.advancedComponent || typeof data === 'object') {
      if (typeof data !== 'object' || !data) data = {};
      (data as any).label = label ? '"' + label + '"' : undefined;
      return data;
    }
    return label;
  }

  private clampValue(value: number): number {
    if (this.inputConfig.type === 'slider') {
      if (value > this.inputConfig.max) return this.inputConfig.max;
      if (value < this.inputConfig.min) return this.inputConfig.min;
    }
    return value;
  }
}

export type SettingMap<T extends SettingGroup> = {
  [key in ServerSettingGroup[T]]: Setting;
};

export type ServerSettingMap<T extends SettingGroup = SettingGroup> = {
  [K in ServerSettingGroup[T]]: DBSetting<T>;
}
