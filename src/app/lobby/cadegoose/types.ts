import { ChatMessage, Message } from '../../chat/types';
import { ServerSettingMap } from '../../settings/types';
import { BoatStatus, BoatSync, BoatTick, Clutter, MoveMessageIncoming, Sync, Team, Turn } from '../quacken/boats/types';
import { StatRow } from './stats/types';

export const enum LobbyStatus {
  PreMatch,
  MidMatch,
  Voting,
  Paused,
  Waiting,
}

export interface Lobby {
  id: number;
  owner: boolean;
  players: any[];
  playing?: boolean;
  scores?: number[];
  treasure?: number[];
  turnsLeft: number;
  seconds?: number;
  stats?: Record<number, StatRow>;
  type: 'Quacken' | 'Spades' | 'CadeGoose' | 'FlagGames' | 'mapinfo' | 'BA';
  settings?: ServerSettingMap;
  inProgress: LobbyStatus;
}

export interface ListLobby extends Lobby {
  group: Partial<ServerSettingMap>;
  name: string;
}

export interface CadeLobby extends Lobby {
  players: TeamMessage[];
  map: string;
  seed: string;
  flags: Turn['flags'];
  boats: { [key: string]: BoatSync };
  clutter?: Clutter[];
  points: number[];
  myMoves?: MoveMessageIncoming;
  moves?: MoveMessageIncoming[];
}

export interface TeamMessage extends ChatMessage {
  t: keyof typeof TeamImages;
  r: boolean;
  b: number;
  s: number;
  a: boolean;
  jq: number;
  ti: number[];
  sc: number[];
  v: number;
  pc: number;
  h?: boolean;
}

export interface ParsedTurn {
  turn: number;
  rawTurn: Turn;
  index: number;
  teams: {
    score: number;
    scoreChange: number;
    sinks: Message[];
  }[];
  sync: Sync;
  ticks: Record<number, BoatTick>;
  moves: Record<number, { shots: number[], moves: number[] }>;
  steps: BoatStatus[][];
  cSteps: Clutter[][];
  stats: Record<number, StatRow>;
}

export const TeamImages = {
  0: { title: 'Defenders', src: 'assets/images/icon_defend1.png' },
  1: { title: 'Attackers', src: 'assets/images/icon_attack1.png' },
  2: { title: '2nd Attackers', src: 'assets/images/icon_attack2.png' },
  3: { title: '3rd Attackers', src: 'assets/images/icon_attack3.png' },
  99: { title: 'Watchers', src: 'assets/images/watch.png' },
};
