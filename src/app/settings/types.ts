import { BehaviorSubject } from 'rxjs';

export interface Setting {
  id: number;
  name: string;
  title: string;
  group: string;
  value: number;
  data?: any;
}

export interface SettingPartial {
  id?: number;
  value: number;
  data?: any;
  stream?: BehaviorSubject<number>;
}

export interface SettingMap {
  [key: string]: SettingPartial | undefined;
}
