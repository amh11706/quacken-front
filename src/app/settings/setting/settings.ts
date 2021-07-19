/* eslint-disable no-sparse-arrays */
import { OutCmd } from '../../ws-messages';

export const Settings = {
  startNew: { admin: true, type: 'button', label: 'New Round', trigger: OutCmd.ChatCommand, data: '/start new' },
  nextBoat: {
    id: 1,
    group: 'boats',
    name: 'quacken',
    type: 'boat',
    trigger: OutCmd.NextBoat,
    titles: ['Rocket', 'Armored', 'Bomb', 'Bread', 'Maiden', , , , , , 'Small Duck', 'Medium Duck', 'Large Duck', 'Defenduck'],
    groups: [
      { name: 'Standard', options: [0, 1, 2, 3, 4] },
      { name: 'Ducks', options: [10, 11, 12, 13] },
    ],
  },
  nextCadeBoat: {
    id: 19,
    group: 'boats',
    name: 'cade',
    type: 'boat',
    trigger: OutCmd.NextBoat,
    titles: [, , , , , , , , , , , , , ,
      'Sloop', 'Cutter', 'Dhow', 'Fanchuan', 'Longship', 'Baghlah', 'Merchant Brig', 'Junk',
      'War Brig', 'Merchant Galleon', 'Xebec', 'War Galleon', 'War Frigate', 'Grand Frigate',
    ],
    groups: [
      { name: 'Next Ship', options: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27] },
    ],
  },
  mapScale: {
    id: 2, group: 'graphics', type: 'slider', label: 'Map Scale', min: 15, max: 100, step: 1,
  },
  speed: {
    id: 3, group: 'graphics', type: 'slider', label: 'Animate Speed', min: 10, max: 50, step: 1,
  },
  lockAngle: {
    id: 22, group: 'controls', name: 'lockAngle', type: 'checkbox', label: 'Lock camera rotation',
  },
  water: {
    id: 31, group: 'graphics', name: 'water', type: 'checkbox', label: 'Animated Water',
  },
  showFps: {
    id: 29, group: 'graphics', name: 'showFps', type: 'checkbox', label: 'Show FPS',
  },
  maxFps: {
    id: 28, group: 'graphics', name: 'maxFps', type: 'slider', label: 'Max FPS', min: 15, max: 240, step: 15,
  },
  spawnSide: {
    id: 21,
    group: 'boats',
    type: 'option',
    label: 'Spawn Side',
    trigger: OutCmd.SpawnSide,
    options: [
      'Island', 'Ocean',
    ],
  },
  jobberQuality: {
    admin: true, id: 27, group: 'l/cade', type: 'slider', label: 'Jobber Quality', min: 5, max: 100, step: 5,
  },
  cadeTurnTime: {
    admin: true, id: 30, group: 'l/cade', name: 'turnTime', type: 'slider', label: 'Turn Time', min: 10, max: 35, step: 5,
  },
  cadeTurns: {
    admin: true, id: 34, group: 'l/cade', name: 'turns', type: 'slider', label: 'Turns', min: 15, max: 75, step: 5,
  },
  enableBots: {
    admin: true, id: 35, group: 'l/cade', name: 'bots', type: 'checkbox', label: 'Enable bots',
  },
  botDifficulty: {
    admin: true, id: 36, group: 'l/cade', name: 'botDifficulty', type: 'slider', label: 'Bot difficulty', min: 25, max: 100, step: 25,
  },

  soundMaster: { id: 37, group: 'sounds', name: 'master', type: 'slider', label: 'Master Volume', min: 0, max: 100, step: 5 },
  soundNotify: { id: 38, group: 'sounds', name: 'notification', type: 'slider', label: 'Notifications', min: 0, max: 100, step: 5 },
  soundShip: { id: 39, group: 'sounds', name: 'ship', type: 'slider', label: 'Ship Sounds', min: 0, max: 100, step: 5 },
  soundAlert: { id: 40, group: 'sounds', name: 'alert', type: 'slider', label: 'Alerts', min: 0, max: 100, step: 5 },

  cadePublicMode: {
    admin: true,
    id: 25,
    group: 'l/cade',
    name: 'publicMode',
    type: 'option',
    label: 'Lobby Privacy',
    options: [
      'Public', 'Public Application', 'Invite Only',
    ],
  },
  cadeMaxPlayers: {
    admin: true, id: 24, group: 'l/cade', name: 'maxPlayers', type: 'slider', label: 'Max Players', min: 0, max: 40,
  },
  cadeSpawnDelay: {
    admin: true, id: 42, group: 'l/cade', name: 'spawnDelay', type: 'slider', label: 'Respawn Delay', min: 0, max: 5,
  },
  cadeHotEntry: {
    admin: true, id: 26, group: 'l/cade', name: 'hotEntry', type: 'checkbox', label: 'Allow join while an<br>entry is in progress',
  },
  cadeMap: {
    admin: true, id: 18, group: 'l/cade', name: 'map', type: 'customMap', label: 'Custom Map', cmd: OutCmd.CgMapList,
  },
  duckLvl: {
    admin: true, id: 4, group: 'l/quacken', type: 'slider', label: 'Duck Level', min: 0, max: 11, step: 1,
  },
  maxPlayers: {
    admin: true, id: 5, group: 'l/quacken', type: 'slider', label: 'Max Players', min: 0, max: 13,
  },
  publicMode: {
    admin: true,
    id: 6,
    group: 'l/quacken',
    type: 'option',
    label: 'Lobby Privacy',
    options: [
      'Public', 'Public Application', 'Invite Only',
    ],
  },
  tileSet: {
    admin: true, id: 7, group: 'l/quacken', type: 'tileSet', label: 'Tile Set', cmd: OutCmd.TileSetList,
  },
  structureSet: {
    admin: true, id: 8, group: 'l/quacken', type: 'structureSet', label: 'Structure Set', cmd: OutCmd.StructureSetList,
  },
  hotEntry: {
    admin: true, id: 9, group: 'l/quacken', type: 'checkbox', label: 'Allow join while an<br>entry is in progress',
  },
  autoGen: {
    admin: true, id: 10, group: 'l/quacken', type: 'checkbox', label: 'Generate new map<br>when a round starts',
  },
  kbControls: {
    id: 11, group: 'controls', type: 'checkbox', label: 'Enable keyboard<br>move entry',
  },
  alwaysChat: {
    id: 41, group: 'controls', type: 'checkbox', label: 'Always focus chat',
  },
  customMap: {
    admin: true, id: 12, group: 'l/quacken', type: 'customMap', label: 'Custom Map', cmd: OutCmd.MapList,
  },
  hideMoves: {
    admin: true, id: 13, group: 'l/quacken', type: 'checkbox', label: 'Hide Moves',
  },
  createType: {
    id: 14,
    group: 'l/create',
    type: 'option',
    options: [
      'Quacken', 'Spades', 'Cadesim', 'Sea Battle',
    ],
  },
  turnTime: {
    admin: true, id: 15, group: 'l/spades', type: 'slider', label: 'Turn Time', min: 5, max: 30,
  },
  playTo: {
    admin: true, id: 16, group: 'l/spades', type: 'slider', label: 'Play To', min: 250, max: 1000, step: 50,
  },
  watchers: {
    admin: true, id: 17, group: 'l/spades', type: 'checkbox', label: 'Allow Watchers',
  },
  updateLinked: {
    id: 33, group: 'controls', type: 'checkbox', label: 'Update linked settings',
  },
};
