import { Leader, RankLeader, WinLoss, UserRank, Stat, Match } from '../esc-menu/profile/types';
import { Top3Area } from '../list/leader-card/leader-card.component';
import { ServerBASettings } from '../lobby/boardadmiral/ba-render';
import { ParsedTurn } from '../lobby/cadegoose/types';
import { BoatSync, BoatTick } from '../lobby/quacken/boats/types';
import { DBTile } from '../map-editor/types';
import { AiData, MatchAiRequest, MoveNode, Points, ScoreResponse } from '../replay/cadegoose/types';
import { MapOption } from '../settings/map-list/map-card/types';
import { ServerSettingGroup, SettingGroup } from '../settings/setting/settings';
import { DBSetting, ServerSettingMap } from '../settings/types';
import { OutCmd } from './ws-messages';
import { InMessage } from './ws-subscribe-types';

export type OutRequest = {
  [K in keyof OutCmdInputs]: { cmd: K, data: OutCmdInputs[K] };
}[keyof OutCmdInputs] & { id: number };

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

  [OutCmd.MatchTraining]: { sync: BoatSync[], map: string, myBoat: number, tick?: BoatTick, };
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

  [OutCmd.JoinQueue]: Record<ServerSettingGroup['matchmaking'], number>;
  [OutCmd.GetBotMatch]: OutCmdInputs[OutCmd.JoinQueue];
}

export type OutCmdInputTypes = OutCmdInputs & EmptyCmdBody;
export type InputCmds = keyof OutCmdInputs;
export type InputlessCmds = Exclude<OutCmd, keyof OutCmdInputs>;

type OutCmdReturns = {
  [OutCmd.StatsTop]: Leader[];
  [OutCmd.RanksTop]: { xp: RankLeader[][], tier: RankLeader[][] };
  [OutCmd.RanksTop3]: Top3Area[];
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
  [OutCmd.JoinQueue]: string;
  [OutCmd.GetBotMatch]: number;
  [OutCmd.BASettingsGet]: ServerBASettings[];
}

// we will get undefined if the request crashes on the backend.
export type OutCmdReturnTypes = {
  [K in keyof OutCmdReturns]: OutCmdReturns[K] | undefined;
} & EmptyCmdBody;
