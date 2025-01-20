import { DBSetting } from '../../settings/types';

// const BaseSettings = {
//   createType: { value: 2 },
//   maxPlayers: { id: 24, value: 40 },
//   publicMode: { id: 25, value: 0, data: 'Public' },
//   hotEntry: { id: 26, value: 0, data: 'false' },
//   jobberQuality: {
//     id: 27,
//     value: 105,
//     data: {
//       Sail: 80,
//       Carp: 80,
//       Bilge: 80,
//       Cannon: 100,
//       Maneuver: 20,
//       label: 'Sail: 80, Carp: 80, Bilge: 80, Cannon: 100, Maneuver: 20',
//     },
//   },
//   turnTime: { id: 30, value: 20 },
//   turns: { id: 34, value: 60 },
//   bots: { id: 35, value: 0 },
//   botDifficulty: { id: 36, value: 100 },
//   spawnDelay: { id: 42, value: 1 },
//   teams: { id: 43, value: 2 },
//   fishBoats: { id: 45, value: 0 },
//   allowGuests: { id: 46, value: 0 },
//   showStats: { id: 66, value: 0 },
//   showMoves: { id: 67, value: 1 },
//   showDamage: { id: 69, value: 1 },
// };

interface Competition {
  description: string,
  rounds: {
    description: string,
    games: Record<string, Partial<DBSetting>>[]
  }[],
}

export const Competitions: Competition[] = [
  // {
  //   description: '1v1 Blitz Tournament July 2024',
  //   rounds: [
  //     {
  //       description: 'Group Stage',
  //       games: [
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Round 1', value: 0 },
  //           map: { id: 18, value: 796, data: 'Round 1' },
  //         },
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Round 2', value: 0 },
  //           map: { id: 18, value: 791, data: 'Round 2' },
  //         },
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Round 3', value: 0 },
  //           map: { id: 18, value: 797, data: 'Round 3' },
  //         },
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Round 4', value: 0 },
  //           map: { id: 18, value: 785, data: 'Round 4' },
  //         },
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Round 5', value: 0 },
  //           map: { id: 18, value: 799, data: 'Round 5' },
  //         },
  //       ],
  //     },
  //     {
  //       description: 'Knockout Stage',
  //       games: [
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Round of 16', value: 0 },
  //           map: { id: 18, value: 784, data: 'Round of 16' },
  //         },
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Quarter Finals', value: 0 },
  //           map: { id: 18, value: 788, data: 'Quarter Finals' },
  //         },
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Semi Finals', value: 0 },
  //           map: { id: 18, value: 793, data: 'Semi Finals' },
  //         },
  //       ],
  //     },
  //     {
  //       description: 'Finals',
  //       games: [
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Grand Finals 1', value: 0 },
  //           map: { id: 18, value: 798, data: 'Grand Finals 1' },
  //         },
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Grand Finals 2', value: 0 },
  //           map: { id: 18, value: 786, data: 'Grand Finals 2' },
  //         },
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Grand finals 3', value: 0 },
  //           map: { id: 18, value: 789, data: 'Grand finals 3' },
  //         },
  //       ],
  //     },
  //     {
  //       description: 'Tie Breaker',
  //       games: [
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Tie Breaker 1', value: 0 },
  //           map: { id: 18, value: 800, data: 'Tie Breaker 1' },
  //         },
  //         {
  //           ...BaseSettings,
  //           name: { data: 'Tie Breaker 2', value: 0 },
  //           map: { id: 18, value: 801, data: 'Tie Breaker 2' },
  //         },
  //       ],
  //     },
  //   ],
  // },
];
