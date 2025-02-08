import { DBSetting } from '../../settings/types';

const BaseSettings = {
  createType: { value: 5 },
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
      Cannon: 100,
      Maneuver: 20,
      label: 'Sail: 80, Carp: 80, Bilge: 80, Cannon: 100, Maneuver: 20',
    },
  },
  turnTime: { id: 30, value: 30 },
  turns: { id: 34, value: 60 },
  bots: { id: 35, value: 1 },
  botDifficulty: { id: 36, value: 100 },
  spawnDelay: { id: 42, value: 1 },
  teams: { id: 43, value: 2 },
  fishBoats: { id: 45, value: 0 },
  allowGuests: { id: 46, value: 0 },
  showStats: { id: 66, value: 0 },
  showMoves: { id: 67, value: 1 },
  showDamage: { id: 69, value: 1 },
  baships: { id: 78, value: 2, data: { budget: 200 } },
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
    description: '1v1 BA Tournament February 2025',
    rounds: [
      {
        description: 'Group Stage',
        games: [
          {
            ...BaseSettings,
            name: { data: 'Round 1', value: 0 },
          },
          {
            ...BaseSettings,
            name: { data: 'Round 2', value: 0 },
          },
          {
            ...BaseSettings,
            name: { data: 'Round 3', value: 0 },
          },
          // {
          //   ...BaseSettings,
          //   name: { data: 'Round 4', value: 0 },
          // },
          // {
          //   ...BaseSettings,
          //   name: { data: 'Round 5', value: 0 },
          // },
        ],
      },
      {
        description: 'Knockout Stage',
        games: [
          // {
          //   ...BaseSettings,
          //   name: { data: 'Round of 16', value: 0 },
          // },
          // {
          //   ...BaseSettings,
          //   name: { data: 'Quarter Finals', value: 0 },
          // },
          {
            ...BaseSettings,
            name: { data: 'Semi Finals', value: 0 },
          },
        ],
      },
      {
        description: 'Finals',
        games: [
          {
            ...BaseSettings,
            name: { data: 'Grand Finals 1', value: 0 },
          },
          {
            ...BaseSettings,
            name: { data: 'Grand Finals 2', value: 0 },
          },
          {
            ...BaseSettings,
            name: { data: 'Grand finals 3', value: 0 },
          },
        ],
      },
      {
        description: '3/4 Playoff',
        games: [
          {
            ...BaseSettings,
            name: { data: '3/4 Playoff 1', value: 0 },
          },
          {
            ...BaseSettings,
            name: { data: '3/4 Playoff 2', value: 0 },
          },
          {
            ...BaseSettings,
            name: { data: '3/4 Playoff 3', value: 0 },
          },
        ],
      },
    ],
  },
];
