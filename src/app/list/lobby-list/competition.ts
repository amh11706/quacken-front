const BaseSettings = {
  createType: {
    value: 2,
  },
  map: {
    id: 18,
    value: 0,
    data: 'Generated',
    name: 'map',
  },
  maxPlayers: {
    id: 24,
    value: 40,
    name: 'maxPlayers',
  },
  publicMode: {
    id: 25,
    value: 0,
    data: 'Public',
    name: 'publicMode',
  },
  hotEntry: {
    id: 26,
    value: 1,
    data: 'true',
    name: 'hotEntry',
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
    name: 'jobberQuality',
  },
  turnTime: {
    id: 30,
    value: 30,
    name: 'turnTime',
  },
  turns: {
    id: 34,
    value: 60,
    name: 'turns',
  },
  bots: {
    id: 35,
    value: 0,
    name: 'bots',
  },
  botDifficulty: {
    id: 36,
    value: 100,
    name: 'botDifficulty',
  },
  spawnDelay: {
    id: 42,
    value: 1,
    name: 'spawnDelay',
  },
  teams: {
    id: 43,
    value: 2,
    name: 'teams',
  },
  fishBoats: {
    id: 45,
    value: 0,
    name: 'fishBoats',
  },
};

export const Competitions = [
  {
    ...BaseSettings,
    name: { data: 'R1-1 1v1' },
  },
  {
    ...BaseSettings,
    name: { data: 'R1-2 1v1' },
  },
  {
    ...BaseSettings,
    name: { data: 'R1-3 1v1' },
  },
];
