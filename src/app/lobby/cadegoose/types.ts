import { Message } from '../../chat/types';
import { BoatStatus, BoatTick, Clutter, Sync, Turn } from '../quacken/boats/types';
import { StatRow } from './stats/types';

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
