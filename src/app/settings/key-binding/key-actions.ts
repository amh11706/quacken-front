/* eslint-disable no-unused-vars */
export const enum KeyActions {
  Noop = -1,
  // Global
  FocusChat,
  ToggleEscMenu,
  OpenLobby,
  OpenSettings,
  OpenInventory,
  OpenProfile,
  LeaveLobby,
  Logout,

  // Map editor
  Save = 100,
  Undo,
  Redo,
  OpenMenu,

  // Cadegoose
  CShowStats = 200,
  CForward,
  CLeft,
  CRight,
  CBlank,
  CNextSlot,
  CPrevSlot,
  CBack,
  CBombLeft,
  CBombRight,
  CBombLeftStrict,
  CBombRightStrict,
  CReady,
  CTurnInPlace,
  CDoubleForward,
  CFlotsam,
  CLeftChainshot,
  CRightChainshot,
  CShowExtraStats,

  // Sea battle
  SBShowStats = 300,
  SBForward,
  SBLeft,
  SBRight,
  SBBlank,
  SBNextSlot,
  SBPrevSlot,
  SBBack,
  SBBombLeft,
  SBBombRight,
  SBBombLeftStrict,
  SBBombRightStrict,
  SBToken,
  SBReady,

  // Quacken
  QForward = 400,
  QLeft,
  QRight,
  QBlank,
  QNextSlot,
  QPrevSlot,
  QBack,
  QBombLeft,
  QBombRight,
  QBombLeftStrict,
  QBombRightStrict,
  QToken,
  QReady,

  // Match replay
  Play = 500,
  PrevTurn,
  NextTurn,

  // Board Admiral
  BADecreaseAggro = 600,
  BAIncreaseAggro,
  BASyncAggro,
  BACoverFlags,
  BACoverTiles,
  BAResetCoverage,
  BANextShip,
  BAPrevShip,
  BA1stShip,
  BA2ndShip,
  BA3rdShip,
  BA4thShip,
  BA5thShip,
  BADamageReport,
  BAToggleSink,
}

export const NotActive = 'n/a';

export const enum LinkGroups {
  Forward, Left, Right, Blank,
  NextSlot, PrevSlot, Back,
  BombLeft, BombRight, BombLeftStrict, BombRightStrict,
  ShowStats, Ready,
}

export interface KeyBinding {
  readonly action: KeyActions;
  readonly title: string;
  bindings: [string, string];
  readonly linkGroup?: LinkGroups;
}

export class KeyBindings {
  'Global': KeyBinding[] = [];
  'Cadegoose': KeyBinding[] = [];
  'Board Admiral': KeyBinding[] = [];
  'Sea battle': KeyBinding[] = [];
  // 'Quacken': KeyBinding[] = [];
  'Map editor': KeyBinding[] = [];
  'Match replay': KeyBinding[] = [];
}

type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };
export type StaticKeyBindings = DeepReadonly<KeyBindings>;

export const DefaultBindings: StaticKeyBindings = {
  Global: [
    { action: KeyActions.ToggleEscMenu, title: 'Toggle escape menu', bindings: ['Escape', NotActive] },
    { action: KeyActions.OpenLobby, title: 'Open lobby menu', bindings: ['Ctrl + l', NotActive] },
    { action: KeyActions.OpenSettings, title: 'Open settings', bindings: ['Ctrl + o', NotActive] },
    { action: KeyActions.OpenInventory, title: 'Open inventory', bindings: ['Ctrl + i', NotActive] },
    { action: KeyActions.OpenProfile, title: 'Open profile', bindings: ['Ctrl + p', NotActive] },
    { action: KeyActions.FocusChat, title: 'Focus chat', bindings: ['t', 'Enter'] },
    { action: KeyActions.LeaveLobby, title: 'Leave lobby', bindings: ['Ctrl + b', NotActive] },
    { action: KeyActions.Logout, title: 'Log out', bindings: ['Ctrl + l', NotActive] },
  ],
  Cadegoose: [
    {
      action: KeyActions.CShowStats,
      title: 'Show stats',
      bindings: ['Tab', NotActive],
      linkGroup: LinkGroups.ShowStats,
    },
    {
      action: KeyActions.CShowExtraStats,
      title: 'Show extra stats',
      bindings: ['Shift + Tab', NotActive],
    },
    {
      action: KeyActions.CLeft,
      title: 'Left',
      bindings: ['a', 'ArrowLeft'],
      linkGroup: LinkGroups.Left,
    },
    {
      action: KeyActions.CForward,
      title: 'Forward',
      bindings: ['w', 'ArrowUp'],
      linkGroup: LinkGroups.Forward,
    },
    {
      action: KeyActions.CRight,
      title: 'Right',
      bindings: ['d', 'ArrowRight'],
      linkGroup: LinkGroups.Right,
    },
    {
      action: KeyActions.CBlank,
      title: 'Blank',
      bindings: ['s', 'ArrowDown'],
      linkGroup: LinkGroups.Blank,
    },
    {
      action: KeyActions.CNextSlot,
      title: 'Next slot',
      bindings: ['Shift + S', 'Shift + ArrowDown'],
      linkGroup: LinkGroups.NextSlot,
    },
    {
      action: KeyActions.CPrevSlot,
      title: 'Previous slot',
      bindings: ['Shift + W', 'Shift + ArrowUp'],
      linkGroup: LinkGroups.PrevSlot,
    },
    {
      action: KeyActions.CBack,
      title: 'Back',
      bindings: ['Backspace', 'Ctrl + z'],
      linkGroup: LinkGroups.Back,
    },
    {
      action: KeyActions.CBombLeft,
      title: 'Bomb left',
      bindings: ['q', 'Shift + ArrowLeft'],
      linkGroup: LinkGroups.BombLeft,
    },
    {
      action: KeyActions.CBombRight,
      title: 'Bomb right',
      bindings: ['e', 'Shift + ArrowRight'],
      linkGroup: LinkGroups.BombRight,
    },
    {
      action: KeyActions.CBombLeftStrict,
      title: 'Bomb left strict',
      bindings: ['Shift + Q', NotActive],
      linkGroup: LinkGroups.BombLeftStrict,
    },
    {
      action: KeyActions.CBombRightStrict,
      title: 'Bomb right strict',
      bindings: ['Shift + E', NotActive],
      linkGroup: LinkGroups.BombRightStrict,
    },
    { action: KeyActions.CReady, title: 'Ready', bindings: ['Space', NotActive], linkGroup: LinkGroups.Ready },
    { action: KeyActions.CTurnInPlace, title: 'In-place turn', bindings: ['Shift + A', NotActive] },
    { action: KeyActions.CDoubleForward, title: 'Double forward', bindings: ['Shift + X', NotActive] },
    { action: KeyActions.CFlotsam, title: 'Flotsam', bindings: ['Shift + D', NotActive] },
    { action: KeyActions.CRightChainshot, title: 'Left chainshot', bindings: ['Shift + C', NotActive] },
    { action: KeyActions.CLeftChainshot, title: 'Right chainshot', bindings: ['Shift + Z', NotActive] },
  ],
  'Board Admiral': [
    { action: KeyActions.BADecreaseAggro, title: 'Decrease aggro', bindings: ['a', NotActive] },
    { action: KeyActions.BAIncreaseAggro, title: 'Increase aggro', bindings: ['d', NotActive] },
    // Sync aggro not active by default because it messes with your whole team
    { action: KeyActions.BASyncAggro, title: 'Sync aggro', bindings: [NotActive, NotActive] },
    { action: KeyActions.BACoverFlags, title: 'Cover flags', bindings: ['q', NotActive] },
    { action: KeyActions.BACoverTiles, title: 'Cover tiles', bindings: ['e', NotActive] },
    // Reset coverage not active by default because it's a disruptive action
    { action: KeyActions.BAResetCoverage, title: 'Reset coverage', bindings: [NotActive, NotActive] },
    { action: KeyActions.BADamageReport, title: 'Damage report', bindings: ['z', NotActive] },
    { action: KeyActions.BAToggleSink, title: 'Toggle sink', bindings: ['x', NotActive] },
    { action: KeyActions.BAPrevShip, title: 'Previous ship', bindings: ['w', NotActive] },
    { action: KeyActions.BANextShip, title: 'Next ship', bindings: ['s', NotActive] },
    { action: KeyActions.BA1stShip, title: 'Ship 1', bindings: ['1', NotActive] },
    { action: KeyActions.BA2ndShip, title: 'Ship 2', bindings: ['2', NotActive] },
    { action: KeyActions.BA3rdShip, title: 'Ship 3', bindings: ['3', NotActive] },
    { action: KeyActions.BA4thShip, title: 'Ship 4', bindings: ['4', NotActive] },
    { action: KeyActions.BA5thShip, title: 'Ship 5', bindings: ['5', NotActive] },
  ],
  'Sea battle': [
    {
      action: KeyActions.SBShowStats,
      title: 'Show stats',
      bindings: ['Tab', NotActive],
      linkGroup: LinkGroups.ShowStats,
    },
    {
      action: KeyActions.SBLeft,
      title: 'Left',
      bindings: ['a', 'ArrowLeft'],
      linkGroup: LinkGroups.Left,
    },
    {
      action: KeyActions.SBForward,
      title: 'Forward',
      bindings: ['w', 'ArrowUp'],
      linkGroup: LinkGroups.Forward,
    },
    {
      action: KeyActions.SBRight,
      title: 'Right',
      bindings: ['d', 'ArrowRight'],
      linkGroup: LinkGroups.Right,
    },
    {
      action: KeyActions.SBBlank,
      title: 'Blank',
      bindings: ['s', 'ArrowDown'],
      linkGroup: LinkGroups.Blank,
    },
    {
      action: KeyActions.SBNextSlot,
      title: 'Next slot',
      bindings: ['Shift + S', 'Shift + ArrowDown'],
      linkGroup: LinkGroups.NextSlot,
    },
    {
      action: KeyActions.SBPrevSlot,
      title: 'Previous slot',
      bindings: ['Shift + W', 'Shift + ArrowUp'],
      linkGroup: LinkGroups.PrevSlot,
    },
    {
      action: KeyActions.SBBack,
      title: 'Back',
      bindings: ['Backspace', 'Ctrl + z'],
      linkGroup: LinkGroups.Back,
    },
    {
      action: KeyActions.SBBombLeft,
      title: 'Bomb left',
      bindings: ['q', 'Shift + ArrowLeft'],
      linkGroup: LinkGroups.BombLeft,
    },
    {
      action: KeyActions.SBBombRight,
      title: 'Bomb right',
      bindings: ['e', 'Shift + ArrowRight'],
      linkGroup: LinkGroups.BombRight,
    },
    {
      action: KeyActions.SBBombLeftStrict,
      title: 'Bomb left strict',
      bindings: ['Shift + A', 'Shift + Q'],
      linkGroup: LinkGroups.BombLeftStrict,
    },
    {
      action: KeyActions.SBBombRightStrict,
      title: 'Bomb right strict',
      bindings: ['Shift + D', 'Shift + E'],
      linkGroup: LinkGroups.BombRightStrict,
    },
    { action: KeyActions.SBReady, title: 'Ready', bindings: ['Space', NotActive], linkGroup: LinkGroups.Ready },
  ],
  // Quacken: [
  //   {
  //     action: KeyActions.QLeft,
  //     title: 'Left',
  //     bindings: ['a', 'ArrowLeft'],
  //     linkGroup: LinkGroups.Left,
  //   },
  //   {
  //     action: KeyActions.QForward,
  //     title: 'Forward',
  //     bindings: ['w', 'ArrowUp'],
  //     linkGroup: LinkGroups.Forward,
  //   },
  //   {
  //     action: KeyActions.QRight,
  //     title: 'Right',
  //     bindings: ['d', 'ArrowRight'],
  //     linkGroup: LinkGroups.Right,
  //   },
  //   {
  //     action: KeyActions.QBlank,
  //     title: 'Blank',
  //     bindings: ['s', 'ArrowDown'],
  //     linkGroup: LinkGroups.Blank,
  //   },
  //   {
  //     action: KeyActions.QNextSlot,
  //     title: 'Next slot',
  //     bindings: ['Shift + S', 'Shift + ArrowDown'],
  //     linkGroup: LinkGroups.NextSlot,
  //   },
  //   {
  //     action: KeyActions.QPrevSlot,
  //     title: 'Previous slot',
  //     bindings: ['Shift + W', 'Shift + ArrowUp'],
  //     linkGroup: LinkGroups.PrevSlot,
  //   },
  //   {
  //     action: KeyActions.QBack,
  //     title: 'Back',
  //     bindings: ['Backspace', 'Ctrl + z'],
  //     linkGroup: LinkGroups.Back,
  //   },
  //   {
  //     action: KeyActions.QBombLeft,
  //     title: 'Bomb left',
  //     bindings: ['q', 'Shift + ArrowLeft'],
  //     linkGroup: LinkGroups.BombLeft,
  //   },
  //   {
  //     action: KeyActions.QBombRight,
  //     title: 'Bomb right',
  //     bindings: ['e', 'Shift + ArrowRight'],
  //     linkGroup: LinkGroups.BombRight,
  //   },
  //   {
  //     action: KeyActions.QBombLeftStrict,
  //     title: 'Bomb left strict',
  //     bindings: ['Shift + A', 'Shift + Q'],
  //     linkGroup: LinkGroups.BombLeftStrict,
  //   },
  //   {
  //     action: KeyActions.QBombRightStrict,
  //     title: 'Bomb right strict',
  //     bindings: ['Shift + D', 'Shift + E'],
  //     linkGroup: LinkGroups.BombRightStrict,
  //   },
  //   { action: KeyActions.QToken, title: 'Token', bindings: ['x', NotActive] },
  //   { action: KeyActions.QReady, title: 'Ready', bindings: ['Space', NotActive] },
  // ],
  'Map editor': [
    { action: KeyActions.Save, title: 'Save', bindings: ['Ctrl + s', NotActive] },
    { action: KeyActions.Undo, title: 'Undo', bindings: ['Ctrl + z', NotActive] },
    { action: KeyActions.Redo, title: 'Redo', bindings: ['Ctrl + y', NotActive] },
  ],
  'Match replay': [
    { action: KeyActions.Play, title: 'Play/pause', bindings: ['Space', 's'] },
    { action: KeyActions.PrevTurn, title: 'Previous turn', bindings: ['a', 'ArrowLeft'] },
    { action: KeyActions.NextTurn, title: 'Next turn', bindings: ['d', 'ArrowRight'] },
  ],
};
