import { SettingGroup } from "../../settings/setting/settings";

export const SbDesc = 'Sea Battle: Sink the enemy ship to win!';
export const QuackenDesc = 'Quacken: Sneak or fight your way past the greedy ducks to steal their food and bring it home.';
export const BoardadmiralDesc = 'Board Admiral: Command your fleet to victory in a game of naval strategy and tactics.';
export const FgDesc = 'Flag games: Plant flags in the enemy base to score points!';
export const CadeDesc = 'Blockade: Use your ship to contest flags and sink enemy ships in a battle for points.';

export const enum LobbyStatus {
  PreMatch,
  MidMatch,
  Voting,
  Paused,
  Waiting,
}

export const enum RankArea {
  Spades = 0,
  Quacken = 1,
  Cade = 2,
  SeaBattle = 3,
  FlagGames = 4,
  BoardAdmiral = 5,
}

export interface LobbyTypeInfo {
  name: string;
  id: RankArea;
  sGroup: SettingGroup;
  desc: string;
}

export const LobbyTypes: Record<LobbyType, LobbyTypeInfo> = {
  [LobbyType.Spades]: { name: 'Spades', id: RankArea.Spades, sGroup: 'l/spades', desc: 'A classic card game.' },
  [LobbyType.Quacken]: { name: 'Quacken', id: RankArea.Quacken, sGroup: 'l/quacken', desc: QuackenDesc },
  [LobbyType.CadeGoose]: { name: 'Blockade', id: RankArea.Cade, sGroup: 'l/cade', desc: CadeDesc },
  [LobbyType.SeaBattle]: { name: 'Sea Battle', id: RankArea.SeaBattle, sGroup: 'l/cade', desc: SbDesc },
  [LobbyType.FlagGames]: { name: 'Capture the Flag', id: RankArea.FlagGames, sGroup: 'l/flaggames', desc: FgDesc },
  [LobbyType.BA]: { name: 'Board Admiral', id: RankArea.BoardAdmiral, sGroup: 'l/cade', desc: BoardadmiralDesc },
  [LobbyType.mapinfo]: { name: 'Map Info', id: 0, sGroup: 'l/cade', desc: 'Map debugging.' },
};

export const ActiveLobbyTypes = [
  LobbyTypes[LobbyType.CadeGoose],
  LobbyTypes[LobbyType.SeaBattle],
  LobbyTypes[LobbyType.FlagGames],
  LobbyTypes[LobbyType.BA],
];

export const enum LobbyType {
  Quacken = 'Quacken',
  Spades = 'Spades',
  CadeGoose = 'CadeGoose',
  FlagGames = 'FlagGames',
  SeaBattle = 'SeaBattle',
  BA = 'BA',
  mapinfo = 'mapinfo',
}
