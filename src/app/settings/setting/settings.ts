/* eslint-disable no-sparse-arrays */
import { OutCmd } from '../../ws-messages';
import { BotSettingComponent } from '../bot-setting/bot-setting.component';
import { JobberQualityComponent } from '../jobber-quality/jobber-quality.component';
import { SettingPartial } from '../settings.service';

interface BaseSetting {
  readonly type: string;
  readonly admin?: boolean;
  readonly label?: string;
  readonly id: number;
  readonly group: string;
  readonly name: string;
  readonly advancedComponent?: any;
  readonly trigger?: OutCmd;
}

interface ButtonSetting extends BaseSetting {
  readonly type: 'button',
  readonly trigger: OutCmd;
  readonly data: string;
}

export interface BoatSetting extends BaseSetting {
  readonly type: 'boat',
  readonly trigger: OutCmd;
  readonly titles: readonly (string | undefined)[];
  readonly groups: readonly { name: string, options: readonly number[] }[];
}

export interface SliderSetting extends BaseSetting {
  readonly type: 'slider',
  readonly min: number,
  readonly max: number,
  readonly step: number,
  readonly stepLabels?: Record<number, string>;
  readonly setLabel?: (s: SettingPartial) => void;
}

export interface OptionSetting extends BaseSetting {
  readonly type: 'option',
  readonly options: readonly string[];
  readonly trigger?: OutCmd;
}

interface CheckboxSetting extends BaseSetting {
  readonly type: 'checkbox',
}

export interface CustomMapSetting extends BaseSetting {
  readonly type: 'customMap' | 'tileSet' | 'structureSet',
  readonly cmd: OutCmd,
}

export type Setting = ButtonSetting | BoatSetting | SliderSetting | OptionSetting | CheckboxSetting | CustomMapSetting;

type SettingName = 'startNew' | 'nextBoat' | 'nextCadeBoat' | 'mapScale' | 'speed' | 'lockAngle' | 'water' | 'showFps' |
  'maxFps' | 'spawnSide' | 'jobberQuality' | 'cadeTurnTime' | 'cadeTurns' | 'enableBots' | 'botDifficulty' | 'soundMaster' |
  'soundNotify' | 'soundShip' | 'soundAlert' | 'cadePublicMode' | 'cadeMaxPlayers' | 'cadeSpawnDelay' | 'cadeHotEntry' |
  'cadeMap' | 'cadeTeams' | 'duckLvl' | 'maxPlayers' | 'publicMode' | 'tileSet' | 'structureSet' | 'hotEntry' | 'autoGen' |
  'kbControls' | 'alwaysChat' | 'customMap' | 'hideMoves' | 'createType' | 'turnTime' | 'playTo' | 'watchers' | 'updateLinked' |
  'renderMode' | 'fishBoats' | 'allowGuests';

export const Settings: Record<SettingName, Setting> = {
  startNew: { admin: true, type: 'button', label: 'New Round', trigger: OutCmd.ChatCommand, data: '/start new' } as ButtonSetting,
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
  mapScale: { id: 2, group: 'graphics', type: 'slider', label: 'Map Scale', min: 15, max: 100, step: 1, name: 'mapScale' },
  speed: { id: 3, group: 'graphics', type: 'slider', label: 'Animate Speed', min: 10, max: 50, step: 1, name: 'speed' },
  water: { id: 31, group: 'graphics', name: 'water', type: 'checkbox', label: 'Animated Water' },
  showFps: { id: 29, group: 'graphics', name: 'showFps', type: 'checkbox', label: 'Show FPS' },
  maxFps: { id: 28, group: 'graphics', name: 'maxFps', type: 'slider', label: 'Max FPS', min: 15, max: 240, step: 15 },
  renderMode: { id: 44, group: 'graphics', name: 'renderMode', type: 'option', label: 'Render Mode', options: ['2D', '3D'] },
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
    // eslint-disable-next-line object-property-newline
    admin: true, id: 27, group: 'l/cade', type: 'slider', label: 'Jobber Quality', min: 5, max: 105, step: 5, name: 'jobberQuality',
    stepLabels: { 105: 'Advanced' },
    advancedComponent: JobberQualityComponent,
    setLabel: (s) => {
      if (!s.data) s.data = { Sail: 70, Carp: 70, Bilge: 70, Cannon: 70, Maneuver: 70 };
      delete s.data.label;
      if (s.value > 100) s.data.label = Object.entries(s.data).map(e => `${e[0]}: ${e[1] as number > 100 ? 'Unlimited' : e[1]}`).join(', ');
    },
  },
  cadeTurnTime: {
    // eslint-disable-next-line object-property-newline
    admin: true, id: 30, group: 'l/cade', name: 'turnTime', type: 'slider', label: 'Turn Time', min: 10, max: 40, step: 5,
    stepLabels: { 40: 'Unlimited' },
  },
  cadeTurns: { admin: true, id: 34, group: 'l/cade', name: 'turns', type: 'slider', label: 'Turns', min: 15, max: 75, step: 5 },
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
    admin: true, id: 24, group: 'l/cade', name: 'maxPlayers', type: 'slider', label: 'Max Players', min: 0, max: 40, step: 1,
  },
  cadeSpawnDelay: {
    // eslint-disable-next-line object-property-newline
    admin: true, id: 42, group: 'l/cade', name: 'spawnDelay', type: 'slider', label: 'Respawn Delay', min: 0, max: 5, step: 1,
    stepLabels: { 5: 'No Respawn' },
  },
  cadeHotEntry: {
    admin: true, id: 26, group: 'l/cade', name: 'hotEntry', type: 'checkbox', label: 'Allow join while an entry is in progress',
  },
  fishBoats: {
    admin: true, id: 45, group: 'l/cade', name: 'fishBoats', type: 'checkbox', label: 'Fish boat names',
  },
  cadeMap: {
    admin: true, id: 18, group: 'l/cade', name: 'map', type: 'customMap', label: 'Map', cmd: OutCmd.CgMapList,
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
  tileSet: {
    admin: true, id: 7, group: 'l/quacken', type: 'tileSet', label: 'Tile Set', cmd: OutCmd.TileSetList, name: 'tileSet',
  },
  structureSet: {
    admin: true, id: 8, group: 'l/quacken', type: 'structureSet', label: 'Structure Set', cmd: OutCmd.StructureSetList, name: 'structureSet',
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
  alwaysChat: {
    id: 41, group: 'controls', type: 'checkbox', label: 'Always focus chat', name: 'alwaysChat',
  },
  customMap: {
    admin: true, id: 12, group: 'l/quacken', type: 'customMap', label: 'Map', cmd: OutCmd.MapList, name: 'customMap',
  },
  hideMoves: {
    admin: true, id: 13, group: 'l/quacken', type: 'checkbox', label: 'Hide Moves', name: 'hideMoves',
  },
  createType: {
    id: 14,
    group: 'l/create',
    name: 'createType',
    type: 'option',
    options: [
      'Quacken', 'Spades', 'Cadesim', 'Sea Battle',
    ],
  },
  turnTime: {
    admin: true, id: 15, group: 'l/spades', type: 'slider', label: 'Turn Time', min: 5, max: 30, step: 1, name: 'turnTime',
  },
  playTo: {
    admin: true, id: 16, group: 'l/spades', type: 'slider', label: 'Play To', min: 250, max: 1000, step: 50, name: 'playTo',
  },
  watchers: {
    admin: true, id: 17, group: 'l/spades', type: 'checkbox', label: 'Allow Watchers', name: 'watchers',
  },
  updateLinked: {
    id: 33, group: 'controls', type: 'checkbox', label: 'Update linked settings', name: 'updateLinked',
  },
};
