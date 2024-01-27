import { ChatMessage } from '../../chat/types';
import { TeamImages } from '../../lobby/cadegoose/types';

export interface Leader extends ChatMessage {
  name: string;
  value: number;
  details?: string;
  clean?: boolean;
  seed?: string;
  matchId?: number;
}

export interface RankLeader extends ChatMessage {
  userName: string;
  level: number;
  tier: number;
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
  rankArea: number;
  createdAt: number;
  createdAtString: string;
  lobby: string;
  team: keyof typeof TeamImages;
  result: number;
  players: TeamPlayer[];
  teams: TeamPlayer[][];
}
