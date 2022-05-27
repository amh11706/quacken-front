const BaseSettings = {
  createType: { value: 2 },
  maxPlayers: { id: 24, value: 40 },
  publicMode: { id: 25, value: 0, data: 'Public' },
  hotEntry: { id: 26, value: 1, data: 'true' },
  jobberQuality: {
    id: 27,
    value: 105,
    data: { Sail: 80, Carp: 80, Bilge: 80, Cannon: 60, Maneuver: 60 },
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

export const Competitions = [
  {
    description: 'Black Flag Friends and Allies 1v1',
    rounds: [
      {
        description: 'Upper bracket - Round 1',
        games: [
          {
            ...BaseSettings,
            name: { data: 'R1 - 1', value: 0 },
            map: { id: 18, value: 294, data: 'R1 - 1' },
          },
          {
            ...BaseSettings,
            name: { data: 'R1 - 2', value: 0 },
            map: { id: 18, value: 295, data: 'R1 - 2' },
          },
          {
            ...BaseSettings,
            name: { data: 'R1 - 3', value: 0 },
            map: { id: 18, value: 296, data: 'R1 - 3' },
          },
        ],
      },
      {
        description: 'Upper bracket - Round 2',
        games: [
          {
            ...BaseSettings,
            name: { data: 'R2 - 1', value: 0 },
            map: { id: 18, value: 303, data: 'R2 - 1' },
          },
          {
            ...BaseSettings,
            name: { data: 'R2 - 2', value: 0 },
            map: { id: 18, value: 304, data: 'R2 - 2' },
          },
          {
            ...BaseSettings,
            name: { data: 'R2 - 3', value: 0 },
            map: { id: 18, value: 305, data: 'R2 - 3' },
          },
        ],
      },
      {
        description: 'Loser bracket - Round 1',
        games: [
          {
            ...BaseSettings,
            name: { data: 'R1 - Loser', value: 0 },
            map: { id: 18, value: 297, data: 'R1 - Loser' },
          },
        ],
      },
      {
        description: 'Loser bracket - Round 2',
        games: [
          {
            ...BaseSettings,
            name: { data: 'R2 - Loser', value: 0 },
            map: { id: 18, value: 298, data: 'R2 - Loser' },
          },
        ],
      },
    ],
  },
];
