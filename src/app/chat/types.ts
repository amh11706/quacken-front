export interface Command {
  base: string, title: string, params: { name: string, value: string }[], help: string
}

export interface Message {
  type: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message?: any;
  from: string;
  copy?: number;
  sId?: number;
  admin?: number;
  d?: string; // decoration
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
