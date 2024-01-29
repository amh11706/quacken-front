import { Leader, RankLeader, WinLoss, UserRank, Stat, Match } from '../esc-menu/profile/types';
import { ParsedTurn } from '../lobby/cadegoose/types';
import { BoatSync } from '../lobby/quacken/boats/types';
import { DBTile } from '../map-editor/types';
import { AiData, MatchAiRequest, MoveNode, Points, ScoreResponse } from '../replay/cadegoose/types';
import { MapOption } from '../settings/map-list/map-card/types';
import { SettingGroup } from '../settings/setting/settings';
import { DBSetting, ServerSettingMap } from '../settings/types';
import { OutCmd } from './ws-messages';
import { InMessage } from './ws-subscribe-types';

type EmptyCmdBody = {
  [cmd: string]: undefined;
}

type OutCmdInputs = {
  [OutCmd.StatsTop]: number;
  [OutCmd.RanksTop]: number;
  [OutCmd.GetWinLoss]: { name: string, rankArea: number };
  [OutCmd.RanksUser]: string;
  [OutCmd.StatsUser]: string;
  [OutCmd.MatchesUser]: string;
  [OutCmd.SearchNames]: string;
  [OutCmd.SearchNamesOnline]: string;

  [OutCmd.SettingGetGroup]: string;

  [OutCmd.ChangePass]: { newPassword: string, password: string };
  [OutCmd.ChangeName]: { name: string, password: string };
  [OutCmd.ChangeEmail]: { email: string, password: string };

  [OutCmd.Moves]: number[];
  [OutCmd.Bomb]: number;
  [OutCmd.Shots]: number[];

  [OutCmd.MatchTraining]: { sync: BoatSync[], moves: ParsedTurn['moves'], map: string, myBoat: number, };
  [OutCmd.MatchData]: number;
  [OutCmd.MatchScore]: { turns: ParsedTurn[], map: string };
  [OutCmd.MatchAi]: MatchAiRequest;

  [OutCmd.CgMapList]: number;
  [OutCmd.MapList]: number;
  [OutCmd.MapDelete]: { group: string, type: number, id: number };
  [OutCmd.WeightSave]: { group: string, weight: number, id: number };
  [OutCmd.MapCreate]: DBTile;
  [OutCmd.MapSave]: DBTile;
  [OutCmd.MapGet]: { group: string, tile: number };
  [OutCmd.TMapSetGet]: number;
  [OutCmd.TileSetGet]: number;
  [OutCmd.StructureSetGet]: number;
  [OutCmd.TileSetList]: undefined;
  [OutCmd.StructureSetList]: undefined;
}

export type OutCmdInputTypes = OutCmdInputs & EmptyCmdBody;
export type InputCmds = keyof OutCmdInputs;
export type InputlessCmds = Exclude<OutCmd, keyof OutCmdInputs>;

type OutCmdReturns = {
  [OutCmd.StatsTop]: Leader[];
  [OutCmd.RanksTop]: { xp: RankLeader[], tier: RankLeader[] };
  [OutCmd.GetWinLoss]: WinLoss;
  [OutCmd.RanksUser]: UserRank[];
  [OutCmd.StatsUser]: Stat[];
  [OutCmd.MatchesUser]: Match[];
  [OutCmd.SearchNames]: string[];
  [OutCmd.SearchNamesOnline]: string[];

  [OutCmd.SettingGetGroup]: DBSetting[];

  [OutCmd.ChangePass]: string;
  [OutCmd.ChangeName]: string;
  [OutCmd.ChangeEmail]: string;

  [OutCmd.Moves]: number[];
  [OutCmd.Shots]: number[];

  [OutCmd.MatchTraining]: { points: Record<number, Points>, nodes: Record<string, MoveNode> };
  [OutCmd.MatchData]: {
    data?: { messages: InMessage[][], settings: Record<SettingGroup, ServerSettingMap>, seed: string }
  };
  [OutCmd.MatchScore]: ScoreResponse;
  [OutCmd.MatchAi]: AiData;

  [OutCmd.CgMapList]: MapOption[];
  [OutCmd.MapList]: DBTile[];
  [OutCmd.TileSetList]: DBTile[];
  [OutCmd.StructureSetList]: DBTile[];
  [OutCmd.MapDelete]: DBTile;
  [OutCmd.MapSave]: DBTile;
  [OutCmd.MapCreate]: DBTile;
  [OutCmd.MapGet]: DBTile;
  [OutCmd.MapListAll]: Record<string, DBTile[]>;
  [OutCmd.TMapSetGet]: DBTile[];
  [OutCmd.TileSetGet]: DBTile[];
  [OutCmd.StructureSetGet]: DBTile[];
}

// we will get undefined if the request crashes on the backend.
export type OutCmdReturnTypes = {
  [K in keyof OutCmdReturns]: OutCmdReturns[K] | undefined;
} & EmptyCmdBody;
