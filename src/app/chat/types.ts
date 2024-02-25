export interface Command {
  base: string, title: string, params: { name: string, value: string }[], help: string
}

export interface Message {
  type: number;
  message?: any;
  from: string;
  copy?: number;
  sId?: number;
  admin?: number;
}

export interface ChatMessage extends Message {
  time?: number | string;
  ago?: string;
  receivedTime?: string;
}

export interface Invite {
  f: string;
  a: number;
  ty: number;
  tg: number;
  resolved: boolean;
}
