const BaseSettings = {
  createType: {
    value: 2,
  },
  map: {
    id: 18,
    value: 0,
    data: 'Generated',
  },
  maxPlayers: {
    id: 24,
    value: 40,
  },
  publicMode: {
    id: 25,
    value: 0,
    data: 'Public',
  },
  hotEntry: {
    id: 26,
    value: 1,
    data: 'true',
  },
  jobberQuality: {
    id: 27,
    value: 105,
    data: {
      Sail: 80,
      Carp: 80,
      Bilge: 80,
      Cannon: 80,
      Maneuver: 65,
    },
  },
  turnTime: {
    id: 30,
    value: 30,
  },
  turns: {
    id: 34,
    value: 60,
  },
  bots: {
    id: 35,
    value: 0,
  },
  botDifficulty: {
    id: 36,
    value: 100,
  },
  spawnDelay: {
    id: 42,
    value: 1,
  },
  teams: {
    id: 43,
    value: 2,
  },
  fishBoats: {
    id: 45,
    value: 0,
  },
};

export const Competitions = [
  {
    description: 'Black Flag Friends and Allies 1v1',
    rounds: [
      {
        description: 'Round 1 best of 3',
        games: [
          {
            ...BaseSettings,
            name: { data: 'R1-1', value: 0 },
          },
          {
            ...BaseSettings,
            name: { data: 'R1-2', value: 0 },
          },
          {
            ...BaseSettings,
            name: { data: 'R1-3', value: 0 },
          },
        ],
      },
      {
        description: 'Round 2 best of 3',
        games: [
          {
            ...BaseSettings,
            name: { data: 'R2-1', value: 0 },
          },
          {
            ...BaseSettings,
            name: { data: 'R2-2', value: 0 },
          },
          {
            ...BaseSettings,
            name: { data: 'R2-3', value: 0 },
          },
        ],
      },
    ],
  },
];
