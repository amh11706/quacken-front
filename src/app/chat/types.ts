import { TeamImages } from '../lobby/cadegoose/types';

export interface Message {
  type: number;
  message?: any;
  team?: keyof typeof TeamImages;
  op?: boolean;
  from: string;
  copy?: number;
  sId?: number;
  admin: number;
}

export interface ChatMessage extends Message {
  friend?: boolean;
  blocked?: boolean;
  time?: number | string;
  ago?: string;
}

export interface Invite {
  f: string;
  a: number;
  ty: number;
  tg: number;
  resolved: boolean;
}
