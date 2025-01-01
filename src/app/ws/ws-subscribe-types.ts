import { Boat } from '../lobby/quacken/boats/boat';
import { BoatSync, BoatTick, MoveMessage, MoveMessageIncoming, Sync, Turn } from '../lobby/quacken/boats/types';
import { InCmd, Internal } from './ws-messages';
import { DBSetting } from '../settings/types';
import { ListLobby, Lobby, LobbyStatus, TeamMessage } from '../lobby/cadegoose/types';
import { Player } from '../lobby/spades/types';
import { Command, Invite, Message } from '../chat/types';
import { InvUpdate, Inventory } from '../esc-menu/profile/types';
import { TokenUser } from './ws.service';

export type InMessage = {
  [K in keyof SubscribeData]: { cmd: K, id?: number, data: SubscribeData[K] };
}[keyof SubscribeData];

type InternalData = {
  [Internal.Lobby]: Lobby;
  [Internal.Canvas]: HTMLCanvasElement;
  [Internal.SetMap]: string;
  [Internal.Time]: string;
  [Internal.MyMoves]: MoveMessage;

  [Internal.ResetBoats]: undefined;
  [Internal.ResetMoves]: undefined;
  [Internal.OpenAdvanced]: undefined;
}

export type SubscribeData = {
  [InCmd.NavigateTo]: string;
  [InCmd.Kick]: string;
  [InCmd.Copy]: number;
  [InCmd.SessionId]: number;
  [InCmd.Reload]: undefined;
  [InCmd.ChatCommands]: { lobby: Command[], global: Command[], lobbyAdmin?: Command[] };

  [InCmd.ChatMessage]: Message;
  [InCmd.FriendAdd]: Message;
  [InCmd.FriendRemove]: Message;
  [InCmd.FriendOnline]: Message;
  [InCmd.FriendOffline]: Message;
  [InCmd.FriendList]: { online: string[], offline: string[], blocked: string[] };
  [InCmd.InviteAdd]: Invite;
  [InCmd.InviteRemove]: Invite;
  [InCmd.BlockUser]: string;
  [InCmd.UnblockUser]: string;
  [InCmd.UpdateUser]: { from: string, d: string };

  [InCmd.SettingSet]: DBSetting;
  [InCmd.IntentoryOpen]: Inventory;
  [InCmd.InventoryUpdate]: InvUpdate;
  [InCmd.InventoryCoin]: number;
  [InCmd.SetUser]: Partial<TokenUser>;

  [InCmd.PlayerAdd]: Message;
  [InCmd.PlayerRemove]: number;
  [InCmd.PlayerList]: Message[];
  [InCmd.LobbyList]: ListLobby[];
  [InCmd.LobbyUpdate]: ListLobby;
  [InCmd.LobbyRemove]: number;
  [InCmd.LobbyStatus]: LobbyStatus;

  [InCmd.LobbyJoin]: Lobby;
  [InCmd.Sync]: Sync;
  [InCmd.Turn]: Turn;
  [InCmd.Team]: TeamMessage;
  [InCmd.Moves]: MoveMessageIncoming[] | MoveMessageIncoming;
  [InCmd.BoatTicks]: Record<number, BoatTick>;
  [InCmd.BoatTick]: BoatTick;
  [InCmd.NewBoat]: BoatSync | BoatSync[];
  [InCmd.DelBoat]: number;
  [InCmd.Bomb]: { t: number, m: number };

  [InCmd.OfferBlind]: undefined;
  [InCmd.Over]: undefined;
  [InCmd.Ready]: { id: number, ready: boolean };
  [InCmd.Bidding]: number;
  [InCmd.Take]: number;
  [InCmd.PlayTo]: number;
  [InCmd.Cards]: number[];
  [InCmd.Scores]: number[];
  [InCmd.Sit]: Player;
  [InCmd.Card]: { id: number, position: number };
  [InCmd.Playing]: { id: number, quantity: number };
  [InCmd.QueueLength]: number;
  [InCmd.QueueMatch]: { lobbyId: number, rated: boolean };
} & InternalData;
