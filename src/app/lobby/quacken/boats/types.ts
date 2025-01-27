import { ServerBASettings } from '../../boardadmiral/ba-render';
import { StatRow } from '../../cadegoose/stats/types';

export type Team = 0 | 1 | 2 | 3 | 4 | 99 | 100;

export interface BoatTick {
  t: [number[], number[], number[]];
  d: number;
  b: number;
  tp: number;
  attr: Record<number, number>;
  wt: number;
  wm: number;
}

export interface BoatStatus {
  id: number;
  x: number;
  y: number;
  t: number;
  tf?: number;
  tm?: number;
  s?: number;
  c?: number;
  cd?: number;
}

export interface Maneuver {
  id: number;
  name: string;
  class: string;
  directional?: boolean;
}

export interface BoatSync extends BoatStatus {
  oId?: number;
  team?: Team;
  inSZ: boolean;
  n: string;
  ti?: string;
  f: number;
  b: number;
  tp: number;
  ty: number;
  ml: number;
  mDamage: number;
  mMoves: number;
  inSq: number;
  dShot?: number;
  mvr?: Maneuver[];
}

export interface Clutter {
  id?: number;
  t: number;
  x: number;
  y: number;
  d?: number;
  p?: boolean;
  dir?: number;
  dis?: number;
  dbl?: number;
  tm?: number;
  tf?: number;
  u?: { x: number, y: number, v: number }[];
}

export interface MoveMessage {
  moves: number[];
  shots: number[];
}

export interface MoveMessageIncoming { t: number, m: number[], s?: number[] }

export interface Turn {
  turn: number;
  turnsLeft: number;
  steps: BoatStatus[][];
  cSteps: Clutter[][];
  treasure: number[];
  points: number[];
  flags: { x: number, y: number, t: Team, p: number, cs: number[] }[];
  stats: Record<number, StatRow>;
}

export interface Sync {
  sync: BoatSync[];
  cSync: Clutter[];
  moves?: MoveMessageIncoming[];
  myMoves?: MoveMessageIncoming;
  baData?: ServerBASettings[];
  turn: number;
}
