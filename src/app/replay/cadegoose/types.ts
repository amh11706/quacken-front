import { BoatSync, BoatTick, MoveMessage } from '../../lobby/quacken/boats/types';

export interface Points {
  Shoot: number[][];
  GetShot: number[];
  BoatAt: number[];
  Total: number[];
  Flags: number[];
  Claims: number[];
  EndBonus: number;
}

export interface ClaimOptions {
  MinPoints: number,
  DuplicateDeterence: number,
  RockValue: number,
  WindValue: number,
}

export interface MatchAiRequest {
  team: number;
  boats?: BoatSync[];
  ticks?: Record<number, BoatTick>;
  map?: string;
  seed?: string;
  claimOptions: ClaimOptions;
  claimsOnly: boolean;
  moves?: Record<number, MoveMessage>;
}

export interface AiBoatData {
  id: number;
  claim: { x: number, y: number };
  moveOptions: number[][];
  shots: number[];
  name?: string;
  pm: Record<string, Points>;
}

export interface AiData {
  boats: AiBoatData[];
  claims: { x: number, y: number, size: number }[];
  map?: string;
  flags?: any[];
}

export interface PenaltySummary {
  name: string,
  map: string,
  penalties: number[],
  turns: { turn: number, quantity: number }[][],
  total: number,
}

export interface ScoreResponse {
  totals: PenaltySummary[]
  turns: number[][][]
}

export const enum MoveTiers {
  Poor = 'Poor',
  Fine = 'Fine',
  Good = 'Good',
  Excellent = 'Excellent',
  Incredible = 'Incredible',
}

export class MoveNode {
  Score = 0;
  ShotsHit = 0;
  ShotsTaken = 0;
  RocksBumped = 0;
  PointGain = 0;
  ShotsHitArray: number[] = [];
  ShotsTakenArray: number[] = [];

  tier: MoveTiers = MoveTiers.Poor;
  WreckedBy: string[] = [];
  Wrecks: string[] = [];
  BlockedBy: string[] = [];
  Blocks: string[] = [];
  Moves = '';
}