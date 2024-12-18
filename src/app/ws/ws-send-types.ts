import { Invite } from '../chat/types';
import { MoveMessage } from '../lobby/quacken/boats/types';
import { ServerSettingMap, DBSetting } from '../settings/types';
import { OutCmd } from './ws-messages';

export type SendCmdInputs = {
  [OutCmd.Team]: number;
  [OutCmd.SpawnSide]: number;
  [OutCmd.NextBoat]: number;
  [OutCmd.Ready]: Partial<MoveMessage> & { ready: boolean } | undefined;
  [OutCmd.SetMyJobbers]: number;
  [OutCmd.Vote]: number;
  [OutCmd.RateMap]: { id: number, rating: number };
  [OutCmd.WantManeuver]: number;
  [OutCmd.WantMove]: number;
  [OutCmd.SetMapData]: string;

  [OutCmd.ChatCommand]: string;
  [OutCmd.ChatMessage]: string;
  [OutCmd.LobbyJoin]: number;
  [OutCmd.LobbyApply]: number;
  [OutCmd.SettingSet]: DBSetting;
  [OutCmd.LobbyCreate]: ServerSettingMap;

  [OutCmd.Block]: string;
  [OutCmd.Unblock]: string;
  [OutCmd.FriendInvite]: string;
  [OutCmd.FriendAdd]: string;
  [OutCmd.FriendRemove]: string;
  [OutCmd.FriendDecline]: Invite;
  [OutCmd.SetUserEmoji]: string;

  // TODO: use more complete types
  [OutCmd.InventoryCmd]: { cmd: 'c' | 'o' | 'cb' | 'sort' | 's', id: number, data?: any };

  [OutCmd.Sit]: number;
  [OutCmd.Bid]: number;
  [OutCmd.Kick]: number;
  [OutCmd.Card]: number[];
}

export type SendCmdInputless =
  OutCmd.Sync |
  OutCmd.ShuffleTeams |
  OutCmd.BnavJoin |
  OutCmd.LobbyListJoin |
  OutCmd.EditorJoin |
  OutCmd.Jump |
  OutCmd.DeclineBlind |
  OutCmd.LeaveQueue |
  OutCmd.WatchQueue |
  OutCmd.UnwatchQueue;
