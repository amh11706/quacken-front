import { RankArea } from '../../lobby/cadegoose/lobby-type';
import { TeamImages, TeamMessage } from '../../lobby/cadegoose/types';

export interface Leader extends TeamMessage {
  name: string;
  value: number;
  details?: string;
  clean?: boolean;
  seed?: string;
  matchId?: number;
}

export interface RankLeader extends TeamMessage {
  userName: string;
  level: number;
  tier: number[];
  score: number[];
}

export interface WinLoss {
  wins: number;
  losses: number;
  winsVsMe?: number;
  lossesVsMe?: number;
}

export interface Stat {
  id: number;
  name: string;
  value: number;
  suffix?: number;
}

export interface UserRank {
  name: string;
  level: number;
  tier: number;
  rankArea: number;
  xp: number;
  nextXp: number;
  prevXp: number;
  progress: number;
  title: string;
}

export interface TeamPlayer {
  from: string;
  team: keyof typeof TeamImages;
}

export interface Match {
  matchId: number;
  rank: number;
  score: number;
  xp: number;
  tier: number;
  level: number;
  rankArea: RankArea;
  createdAt: number;
  createdAtString: string;
  lobby: string;
  team: keyof typeof TeamImages;
  result: number;
  players: TeamPlayer[];
  teams: TeamPlayer[][];
}

export interface Item {
  s: number;
  id: number;
  t: number;
  q: number;
  n: string;
  f: boolean;
}

export interface Inventory {
  id: number;
  userId: number;
  items: Item[];
  filtered: Item[];
  sort: keyof Item;
  currency: number;
}

export interface InvUpdate {
  del?: number[];
  new?: Item[];
  update?: { id: number, quantity: number }[];
}
