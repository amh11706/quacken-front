import { DBSetting } from '../../settings/types';

const BaseSettings = {
  createType: { value: 2 },
  maxPlayers: { id: 24, value: 40 },
  publicMode: { id: 25, value: 0, data: 'Public' },
  hotEntry: { id: 26, value: 0, data: 'false' },
  jobberQuality: {
    id: 27,
    value: 105,
    data: {
      Sail: 80,
      Carp: 80,
      Bilge: 80,
      Cannon: 80,
      Maneuver: 20,
      label: 'Sail: 80, Carp: 80, Bilge: 80, Cannon: 80, Maneuver: 20',
    },
  },
  turnTime: { id: 30, value: 35 },
  turns: { id: 34, value: 60 },
  bots: { id: 35, value: 0 },
  botDifficulty: { id: 36, value: 100 },
  spawnDelay: { id: 42, value: 1 },
  teams: { id: 43, value: 2 },
  fishBoats: { id: 45, value: 0 },
  allowGuests: { id: 46, value: 0 },
  showStats: { id: 66, value: 0 },
  showMoves: { id: 67, value: 1 },
  showDamage: { id: 69, value: 1 },
};

interface Competition {
  description: string,
  rounds: {
    description: string,
    games: Record<string, Partial<DBSetting>>[]
  }[],
}

export const Competitions: Competition[] = [
  {
    description: 'DOTD 2v2 Tournament June 2024',
    rounds: [
      {
        description: 'Winner Bracket',
        games: [
          {
            ...BaseSettings,
            name: { data: 'Winners R1', value: 0 },
            map: { id: 18, value: 745, data: 'R1:W' },
          },
          {
            ...BaseSettings,
            name: { data: 'Winners R2', value: 0 },
            map: { id: 18, value: 746, data: 'R2:W+L' },
          },
          {
            ...BaseSettings,
            name: { data: 'Winners R3', value: 0 },
            map: { id: 18, value: 747, data: 'R3:W+L' },
          },
          {
            ...BaseSettings,
            name: { data: 'Winners Final', value: 0 },
            map: { id: 18, value: 748, data: 'FIN:W+L R4' },
          },
        ],
      },
      {
        description: 'Losers Bracket',
        games: [
          {
            ...BaseSettings,
            name: { data: 'Losers R1', value: 0 },
            map: { id: 18, value: 757, data: 'R1:L' },
          },
          {
            ...BaseSettings,
            name: { data: 'Losers R2', value: 0 },
            map: { id: 18, value: 751, data: 'GFIN3:W' },
          },
          {
            ...BaseSettings,
            name: { data: 'Losers R3', value: 0 },
            map: { id: 18, value: 747, data: 'R3:W+L' },
          },
          {
            ...BaseSettings,
            name: { data: 'Losers R4', value: 0 },
            map: { id: 18, value: 748, data: 'FIN:W+L R4' },
          },
          {
            ...BaseSettings,
            name: { data: 'Losers R5', value: 0 },
            map: { id: 18, value: 749, data: 'GFIN1:W+L R5' },
          },
          {
            ...BaseSettings,
            name: { data: 'Losers Final', value: 0 },
            map: { id: 18, value: 758, data: 'LFIN' },
          },
        ],
      },
      {
        description: 'Grand Final',
        games: [
          {
            ...BaseSettings,
            name: { data: 'Grand Final G1', value: 0 },
            map: { id: 18, value: 749, data: 'GFIN1:W+L R5' },
          },
          {
            ...BaseSettings,
            name: { data: 'Grand Final G2', value: 0 },
            map: { id: 18, value: 750, data: 'GFIN2:W' },
          },
          {
            ...BaseSettings,
            name: { data: 'Grand Final G3', value: 0 },
            map: { id: 18, value: 751, data: 'GFIN3:W' },
          },
        ],
      },
    ],
  },
];
