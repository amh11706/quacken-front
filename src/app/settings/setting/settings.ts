/* eslint-disable no-sparse-arrays */
import { OutCmd } from '../../ws/ws-messages';
import { BaShipSettingComponent } from '../ba-ship-setting/ba-ship-setting';
import { BotSettingComponent } from '../bot-setting/bot-setting.component';
import { JobberQualityComponent } from '../jobber-quality/jobber-quality.component';
import { BoatTitles } from '../ship-list/ship-list.component';
import { Setting } from '../types';

interface BaseSetting {
  readonly default?: number;
  readonly admin?: boolean;
  readonly label?: string;
  readonly id: number;
  readonly group: SettingGroup;
  readonly name: ServerSettingGroup[SettingGroup];
  readonly advancedComponent?: unknown;
  readonly trigger?: OutCmd.NextBoat | OutCmd.SpawnSide | OutCmd.ChatCommand;
  readonly cmd?: OutCmd;
  readonly setLabel?: (s: Setting) => string | Setting['data'] | undefined;
}

interface ButtonSetting extends BaseSetting {
  readonly type: 'button',
  readonly trigger?: OutCmd.NextBoat | OutCmd.SpawnSide | OutCmd.ChatCommand;
  readonly data: string | number;
}

export interface BoatSetting extends BaseSetting {
  readonly type: 'boat',
  readonly titles: readonly (string | undefined)[];
  readonly groups: readonly { name: string, options: readonly number[] }[];
}

export interface SliderSetting extends BaseSetting {
  readonly type: 'slider',
  readonly min: number,
  readonly max: number,
  readonly step: number,
  readonly stepLabels?: Record<number, string>;
}

export interface OptionSetting extends BaseSetting {
  readonly type: 'option',
  readonly options: readonly string[];
}

interface CheckboxSetting extends BaseSetting {
  readonly type: 'checkbox',
}

export type SettingInput = ButtonSetting | BoatSetting | SliderSetting | OptionSetting | CheckboxSetting;

export type SettingGroup = keyof ServerSettingGroup;

type ClientSettingGroup = {
  internal: 'startNew',
  boats: 'nextBoat' | 'nextCadeBoat' | 'spawnSide' | 'flagNextBoat',
  graphics: 'mapScale' | 'speed' | 'water' | 'showFps' | 'maxFps' | 'renderMode',
  controls: 'lockAngle' | 'kbControls' | 'alwaysChat' | 'shiftSpecials' | 'updateLinked',
  sounds: 'soundMaster' | 'soundNotify' | 'soundShip' | 'soundAlert',
  'l/quacken': 'duckLvl' | 'maxPlayers' | 'publicMode' | 'hotEntry' | 'autoGen' | 'hideMoves',
  'l/cade': 'jobberQuality' | 'cadeTurnTime' | 'cadeTurns' | 'enableBots' | 'botDifficulty' | 'cadePublicMode' | 'cadeMaxPlayers' | 'baships' |
  'cadeSpawnDelay' | 'cadeHotEntry' | 'cadeShowStats' | 'cadeMap' | 'cadeTeams' | 'cadeShowMoves' | 'cadeShowDamage' |
  'cadeRated' | 'fishBoats' | 'allowGuests' | 'overtime',
  'l/create': 'createType',
  'l/spades': 'turnTime' | 'playTo' | 'watchers',
  matchmaking: 'minTurnTime' | 'maxTurnTime' | 'deltaRank' | 'gameMode' | 'queueRated' | 'showAdvanced' | 'lobbyType' | 'variation',
  'l/flaggames': 'flagMap' | 'flagMaxPlayers' | 'flagPublicMode' | 'flagHotEntry' | 'flagJobberQuality' | 'flagTurnTime' |
  'flagTurns' | 'flagSpawnDelay' | 'flagFishBoats' | 'flagAllowGuests' | 'flagRespawn' | 'flagSteal',
};

export type ServerSettingGroup = {
  internal: '',
  boats: 'quacken' | 'cade' | 'flag' | 'spawnSide',
  graphics: 'mapScale' | 'speed' | 'water' | 'showFps' | 'maxFps' | 'renderMode',
  controls: 'lockAngle' | 'kbControls' | 'alwaysChat' | 'shiftSpecials' | 'updateLinked' | 'bindings',
  sounds: 'master' | 'notification' | 'ship' | 'alert',
  'l/quacken': 'duckLvl' | 'maxPlayers' | 'publicMode' | 'hotEntry' | 'autoGen' | 'hideMoves',
  'l/cade': 'jobberQuality' | 'turnTime' | 'turns' | 'bots' | 'botDifficulty' | 'publicMode' | 'maxPlayers' | 'spawnDelay' | 'baships' |
  'hotEntry' | 'showStats' | 'map' | 'teams' | 'showMoves' | 'showDamage' | 'rated' | 'fishBoats' | 'allowGuests' | 'overtime',
  'l/create': 'createType',
  'l/spades': 'turnTime' | 'playTo' | 'watchers',
  matchmaking: 'minTurnTime' | 'maxTurnTime' | 'deltaRank' | 'gameMode' | 'rated' | 'showAdvanced' | 'lobbyType' | 'variation',
  'l/flaggames': 'map' | 'maxPlayers' | 'publicMode' | 'hotEntry' | 'jobberQuality' | 'turnTime' | 'turns' | 'spawnDelay' |
  'fishBoats' | 'allowGuests' | 'flagRespawn' | 'flagSteal',
};

export type SettingName = ClientSettingGroup[SettingGroup];

export type SettingGroupFromClientName<T extends SettingName> = {
  [K in SettingGroup]: T extends ClientSettingGroup[K] ? K : never
}[SettingGroup];

type SettingList = {
  [K in SettingName]: SettingInput & { group: SettingGroupFromClientName<K> }
};

export const Settings: SettingList = {
  startNew: { id: 0, name: '', admin: true, type: 'button', group: 'internal', label: 'Force Start', trigger: OutCmd.ChatCommand, data: '/start new' },
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
    titles: BoatTitles,
    groups: [
      { name: 'Next Ship', options: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28] },
    ],
  },
  mapScale: { id: 2, group: 'graphics', type: 'slider', label: 'Map Scale', min: 15, max: 100, step: 1, name: 'mapScale', default: 50 },
  speed: { id: 3, group: 'graphics', type: 'slider', label: 'Animate Speed', min: 10, max: 50, step: 1, name: 'speed', default: 10 },
  water: { id: 31, group: 'graphics', name: 'water', type: 'checkbox', label: 'Animated Water', default: 1 },
  showFps: { id: 29, group: 'graphics', name: 'showFps', type: 'checkbox', label: 'Show FPS', default: 0 },
  maxFps: { id: 28, group: 'graphics', name: 'maxFps', type: 'slider', label: 'Max FPS', min: 15, max: 240, step: 15, default: 60 },
  renderMode: { id: 44, group: 'graphics', name: 'renderMode', type: 'option', label: 'Render Mode', options: ['2D', '3D'], default: -1 },
  lockAngle: { id: 22, group: 'controls', name: 'lockAngle', type: 'checkbox', label: 'Lock camera rotation' },
  spawnSide: {
    id: 21,
    group: 'boats',
    name: 'spawnSide',
    type: 'option',
    label: 'Spawn Side',
    trigger: OutCmd.SpawnSide,
    options: [
      'Island', 'Ocean',
    ],
  },
  jobberQuality: {
    admin: true,
    id: 27,
    group: 'l/cade',
    type: 'slider',
    label: 'Jobber Quality',
    min: 5,
    max: 105,
    step: 5,
    name: 'jobberQuality',
    stepLabels: { 105: 'Advanced' },
    advancedComponent: JobberQualityComponent,
    setLabel: (s) => {
      const data = s.data ?? { Sail: 70, Carp: 70, Bilge: 70, Cannon: 70, Maneuver: 70 };
      delete data.label;
      if (s.value > 100) data.label = Object.entries(data).map(e => `${e[0]}: ${e[1] as number > 100 ? 'Unlimited' : e[1]}`).join(', ');
      return data;
    },
  },
  cadeTurnTime: {
    admin: true,
    id: 30,
    group: 'l/cade',
    name: 'turnTime',
    type: 'slider',
    label: 'Turn Time',
    min: 10,
    max: 65,
    step: 5,
    stepLabels: { 65: 'Unlimited' },
    default: 30,
  },
  cadeShowStats: {
    admin: true,
    id: 66,
    group: 'l/cade',
    name: 'showStats',
    type: 'option',
    label: 'Show stats',
    options: ['Disabled', 'Players only', 'Watchers only', 'Everyone'],
  },
  cadeShowMoves: { admin: true, id: 67, group: 'l/cade', name: 'showMoves', type: 'checkbox', label: 'Show team moves' },
  cadeShowDamage: { admin: true, id: 69, group: 'l/cade', name: 'showDamage', type: 'checkbox', label: 'Show team damage' },
  cadeRated: { admin: true, id: 68, group: 'l/cade', name: 'rated', type: 'checkbox', label: 'Rated' },
  cadeTurns: { admin: true, id: 34, group: 'l/cade', name: 'turns', type: 'slider', label: 'Turns', min: 15, max: 75, step: 5, default: 60 },
  enableBots: {
    admin: true,
    id: 35,
    group: 'l/cade',
    name: 'bots',
    type: 'option',
    label: 'Bots',
    options: [
      'Disabled', 'Auto', 'Pad extra', 'Custom',
    ],
    advancedComponent: BotSettingComponent,
  },
  botDifficulty: {
    admin: true, id: 36, group: 'l/cade', name: 'botDifficulty', type: 'slider', label: 'Bot skill', min: 25, max: 100, step: 25,
  },
  baships: {
    admin: true,
    id: 78,
    group: 'l/cade',
    name: 'baships',
    type: 'option',
    label: 'Ships',
    options: [
      '5v5 Frigs', 'Custom', 'Influence cap',
    ],
    advancedComponent: BaShipSettingComponent,
    setLabel: BaShipSettingComponent.setLabel,
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
    admin: true, id: 24, group: 'l/cade', name: 'maxPlayers', type: 'slider', label: 'Max Players', min: 0, max: 40, step: 1,
  },
  cadeSpawnDelay: {
    admin: true,
    id: 42,
    group: 'l/cade',
    name: 'spawnDelay',
    type: 'slider',
    label: 'Respawn Delay',
    min: 0,
    max: 5,
    step: 1,
    stepLabels: { 5: 'No Respawn' },
  },
  cadeHotEntry: {
    admin: true, id: 26, group: 'l/cade', name: 'hotEntry', type: 'checkbox', label: 'Allow join while an entry is in progress',
  },
  fishBoats: {
    admin: true, id: 45, group: 'l/cade', name: 'fishBoats', type: 'checkbox', label: 'Fish boat names',
  },
  cadeMap: {
    admin: true, id: 18, group: 'l/cade', name: 'map', type: 'button', label: 'Map', cmd: OutCmd.CgMapList, data: 2,
  },
  cadeTeams: {
    admin: true, id: 43, group: 'l/cade', name: 'teams', type: 'slider', label: 'Teams', min: 2, max: 4, step: 1,
  },
  allowGuests: {
    admin: true, id: 46, group: 'l/cade', name: 'allowGuests', type: 'checkbox', label: 'Allow Guests',
  },
  duckLvl: {
    admin: true, id: 4, group: 'l/quacken', type: 'slider', label: 'Duck Level', min: 0, max: 11, step: 1, name: 'duckLvl',
  },
  maxPlayers: {
    admin: true, id: 5, group: 'l/quacken', type: 'slider', label: 'Max Players', min: 0, max: 13, step: 1, name: 'maxPlayers',
  },
  publicMode: {
    admin: true,
    id: 6,
    group: 'l/quacken',
    name: 'publicMode',
    type: 'option',
    label: 'Lobby Privacy',
    options: [
      'Public', 'Public Application', 'Invite Only',
    ],
  },
  hotEntry: {
    admin: true, id: 9, group: 'l/quacken', type: 'checkbox', label: 'Allow join while an entry is in progress', name: 'hotEntry',
  },
  autoGen: {
    admin: true, id: 10, group: 'l/quacken', type: 'checkbox', label: 'Generate new map when a round starts', name: 'autoGen',
  },
  kbControls: {
    id: 11, group: 'controls', type: 'checkbox', label: 'Enable keyboard move entry', name: 'kbControls',
  },
  shiftSpecials: {
    id: 65, group: 'controls', type: 'checkbox', label: 'Shift click for maneuvers', name: 'shiftSpecials',
  },
  alwaysChat: {
    id: 41, group: 'controls', type: 'checkbox', label: 'Always focus chat', name: 'alwaysChat',
  },
  hideMoves: {
    admin: true, id: 13, group: 'l/quacken', type: 'checkbox', label: 'Hide Moves', name: 'hideMoves',
  },
  createType: {
    id: 14,
    group: 'l/create',
    name: 'createType',
    label: 'Create Type',
    type: 'option',
    options: [
      '', '', 'Blockade', 'Sea Battle', 'Capture the Flag', 'Board Admiral',
    ],
    default: 2,
  },
  turnTime: {
    admin: true, id: 15, group: 'l/spades', type: 'slider', label: 'Turn Time', min: 5, max: 30, step: 1, name: 'turnTime', default: 15,
  },
  playTo: {
    admin: true, id: 16, group: 'l/spades', type: 'slider', label: 'Play To', min: 250, max: 1000, step: 50, name: 'playTo',
  },
  watchers: {
    admin: true, id: 17, group: 'l/spades', type: 'checkbox', label: 'Allow Watchers', name: 'watchers',
  },
  minTurnTime: {
    id: 70, group: 'matchmaking', type: 'slider', label: 'Min Turn Time', min: 20, max: 35, step: 5, name: 'minTurnTime', default: 20,
  },
  maxTurnTime: {
    id: 71, group: 'matchmaking', type: 'slider', label: 'Max Turn Time', min: 20, max: 35, step: 5, name: 'maxTurnTime', default: 20,
  },
  deltaRank: {
    id: 72, group: 'matchmaking', type: 'slider', label: 'Rating +/- ', min: 25, max: 275, step: 25, stepLabels: { 275: 'Unlimited' }, name: 'deltaRank', default: 50,
  },
  gameMode: {
    id: 73, group: 'matchmaking', type: 'option', label: 'Game Mode', options: ['1v1', '2v2'], name: 'gameMode', default: 0,
  },
  queueRated: {
    id: 75, group: 'matchmaking', type: 'option', label: 'Rated', name: 'rated', options: ['No', 'Yes', 'Any'], default: 2,
  },
  showAdvanced: {
    id: 76, group: 'matchmaking', type: 'checkbox', label: 'Show Advanced', name: 'showAdvanced', default: 0,
  },
  lobbyType: {
    id: 77, group: 'matchmaking', type: 'option', label: 'Lobby Type', options: ['', '', 'Blockade', '', '', 'Board Admiral'], name: 'lobbyType', default: 0,
  },
  variation: {
    id: 79, group: 'matchmaking', type: 'option', label: 'Variation', options: ['Any', '5v5 frigs', 'Influence cap'], name: 'variation', default: 0,
  },
  updateLinked: {
    id: 33, group: 'controls', type: 'checkbox', label: 'Update linked settings', name: 'updateLinked',
  },

  flagMap: {
    admin: true, id: 47, group: 'l/flaggames', name: 'map', type: 'button', label: 'Map', cmd: OutCmd.CgMapList, data: 4,
  },
  flagMaxPlayers: {
    admin: true, id: 48, group: 'l/flaggames', name: 'maxPlayers', type: 'slider', label: 'Max Players', min: 0, max: 40, step: 1,
  },
  flagPublicMode: {
    admin: true,
    id: 49,
    group: 'l/flaggames',
    name: 'publicMode',
    type: 'option',
    label: 'Lobby Privacy',
    options: [
      'Public', 'Public Application', 'Invite Only',
    ],
  },
  flagHotEntry: {
    admin: true, id: 50, group: 'l/flaggames', name: 'hotEntry', type: 'checkbox', label: 'Allow join while an entry is in progress',
  },
  flagJobberQuality: {
    admin: true,
    id: 51,
    group: 'l/flaggames',
    type: 'slider',
    label: 'Jobber Quality',
    min: 5,
    max: 105,
    step: 5,
    name: 'jobberQuality',
    stepLabels: { 105: 'Advanced' },
    advancedComponent: JobberQualityComponent,
    setLabel: (s) => {
      const data = s.data ?? { Sail: 70, Carp: 70, Bilge: 70, Cannon: 70, Maneuver: 70 };
      delete data.label;
      if (s.value > 100) data.label = Object.entries(data).map(e => `${e[0]}: ${e[1] as number > 100 ? 'Unlimited' : e[1]}`).join(', ');
      return data;
    },
  },
  flagTurnTime: {
    admin: true,
    id: 52,
    group: 'l/flaggames',
    name: 'turnTime',
    type: 'slider',
    label: 'Turn Time',
    min: 10,
    max: 65,
    step: 5,
    stepLabels: { 65: 'Unlimited' },
    default: 30,
  },
  flagTurns: {
    admin: true, id: 53, group: 'l/flaggames', name: 'turns', type: 'slider', label: 'Turns', min: 15, max: 75, step: 5, default: 60,
  },
  flagSpawnDelay: {
    admin: true,
    id: 54,
    group: 'l/flaggames',
    name: 'spawnDelay',
    type: 'slider',
    label: 'Spawn Delay',
    min: 0,
    max: 5,
    step: 1,
    stepLabels: { 5: 'No Respawn' },
  },
  flagFishBoats: {
    admin: true, id: 55, group: 'l/flaggames', name: 'fishBoats', type: 'checkbox', label: 'Fish boat names',
  },
  flagAllowGuests: {
    admin: true, id: 56, group: 'l/flaggames', name: 'allowGuests', type: 'checkbox', label: 'Allow Guests',
  },
  flagNextBoat: {
    id: 57,
    group: 'boats',
    name: 'flag',
    type: 'boat',
    trigger: OutCmd.NextBoat,
    titles: [, , , , , , , , , , , , , , ,
      'Healer', 'Sniper', 'Bomber', 'Builder',
    ],
    groups: [
      { name: 'Next Ship', options: [15, 16, 17, 18] },
    ],
  },
  flagRespawn: {
    admin: true, id: 58, group: 'l/flaggames', name: 'flagRespawn', type: 'checkbox', label: 'Respawn 2pt Flags',
  },
  flagSteal: {
    admin: true, id: 59, group: 'l/flaggames', name: 'flagSteal', type: 'checkbox', label: 'Stealable flags on sink',
  },
  overtime: {
    admin: true,
    id: 74,
    group: 'l/cade',
    name: 'overtime',
    type: 'option',
    label: 'Overtime',
    options: ['Disabled', 'Sudden Death', '5 turns + SD', '10 turns + SD', '5 + 5 turns', '10 + 10 turns'],
  },
};

export const SettingValues = Object.values(Settings);
