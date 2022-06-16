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
        description: 'Loser bracket - Round 4',
        games: [
          {
            ...BaseSettings,
            name: { data: 'R4 - Loser', value: 0 },
            map: { id: 18, value: 302, data: 'R4 - Loser' },
          },
        ],
      },
      {
        description: 'Loser bracket - Round 5',
        games: [
          {
            ...BaseSettings,
            name: { data: 'R5 - Loser', value: 0 },
            map: { id: 18, value: 312, data: 'R5 - Loser' },
          },
        ],
      },
      {
        description: 'Loser bracket - Round 6',
        games: [
          {
            ...BaseSettings,
            name: { data: 'R6 - Loser', value: 0 },
            map: { id: 18, value: 331, data: 'R6 - Loser' },
          },
        ],
      },
      {
        description: 'Loser bracket - Finals',
        games: [
          {
            ...BaseSettings,
            name: { data: 'Loser Finals - 1', value: 0 },
            map: { id: 18, value: 317, data: 'Loser Finals - 1' },
          },
          {
            ...BaseSettings,
            name: { data: 'Loser Finals - 2', value: 0 },
            map: { id: 18, value: 320, data: 'Loser Finals - 2' },
          },
          {
            ...BaseSettings,
            name: { data: 'Loser Finals - 3', value: 0 },
            map: { id: 18, value: 321, data: 'Loser Finals - 3' },
          },
        ],
      },
    ],
  },
];
