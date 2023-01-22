import { SettingMap } from '../../settings/settings.service';

const BaseSettings = {
  createType: { value: 2 },
  maxPlayers: { id: 24, value: 40 },
  publicMode: { id: 25, value: 0, data: 'Public' },
  hotEntry: { id: 26, value: 0, data: 'false' },
  jobberQuality: {
    id: 27,
    value: 105,
    data: {
      Sail: 100,
      Carp: 100,
      Bilge: 100,
      Cannon: 100,
      Maneuver: 10,
      label: 'Sail: 100, Carp: 100, Bilge: 100, Cannon: 100, Maneuver: 10',
    },
  },
  turnTime: { id: 30, value: 30 },
  turns: { id: 34, value: 60 },
  bots: { id: 35, value: 0 },
  botDifficulty: { id: 36, value: 100 },
  spawnDelay: { id: 42, value: 1 },
  teams: { id: 43, value: 2 },
  fishBoats: { id: 45, value: 0 },
  allowGuests: { id: 46, value: 0 },
};

interface Competition {
  description: string,
  rounds: {
    description: string,
    games: SettingMap[]
  }[],
}

export const Competitions: Competition[] = [
  {
    description: '2023 Sabotage 1v1 tournament',
    rounds: [
      {
        description: 'KO stage R32',
        games: [
          {
            ...BaseSettings,
            name: { data: 'KO R32 G1', value: 0 },
            map: { id: 18, value: 483, data: '2023-Map6' },
          },
          {
            ...BaseSettings,
            name: { data: 'KO R32 G2', value: 0 },
            map: { id: 18, value: 482, data: '2023-Map5' },
          },
          {
            ...BaseSettings,
            name: { data: 'KO R32 G3', value: 0 },
            map: { id: 18, value: 481, data: '2023-Map4' },
          },
        ],
      },
      {
        description: 'KO stage R16',
        games: [
          {
            ...BaseSettings,
            name: { data: 'KO R16 G1', value: 0 },
            map: { id: 18, value: 480, data: '2023-Map3' },
          },
          {
            ...BaseSettings,
            name: { data: 'KO R16 G2', value: 0 },
            map: { id: 18, value: 479, data: '2023-Map2' },
          },
          {
            ...BaseSettings,
            name: { data: 'KO R16 G3', value: 0 },
            map: { id: 18, value: 478, data: '2023-Map1' },
          },
        ],
      },
      // {
      //   description: 'Loser bracket - Round 6',
      //   games: [
      //     {
      //       ...BaseSettings,
      //       name: { data: 'R6 - Loser', value: 0 },
      //       map: { id: 18, value: 331, data: 'R6 - Loser' },
      //     },
      //   ],
      // },
      // {
      //   description: 'Loser bracket - Finals',
      //   games: [
      //     {
      //       ...BaseSettings,
      //       name: { data: 'Loser Finals - 1', value: 0 },
      //       map: { id: 18, value: 317, data: 'Loser Finals - 1' },
      //     },
      //     {
      //       ...BaseSettings,
      //       name: { data: 'Loser Finals - 2', value: 0 },
      //       map: { id: 18, value: 320, data: 'Loser Finals - 2' },
      //     },
      //     {
      //       ...BaseSettings,
      //       name: { data: 'Loser Finals - 3', value: 0 },
      //       map: { id: 18, value: 321, data: 'Loser Finals - 3' },
      //     },
      //   ],
      // },
    ],
  },
];
