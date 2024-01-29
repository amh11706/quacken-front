import { Scene } from 'three';
import { Boat } from '../lobby/quacken/boats/boat';
import { BoatSync, BoatTick, MoveMessage, MoveMessageIncoming, Sync, Turn } from '../lobby/quacken/boats/types';
import { InCmd, Internal } from './ws-messages';
import { DBSetting } from '../settings/types';
import { Lobby, TeamMessage } from '../lobby/cadegoose/types';
import { Player } from '../lobby/spades/types';
import { Command, Invite, Message } from '../chat/types';
import { InvUpdate, Inventory } from '../esc-menu/profile/types';

export type InMessage = {
  [K in keyof SubscribeData]: { cmd: K, id?: number, data: SubscribeData[K] };
}[keyof SubscribeData];

type InternalData = {
  [Internal.Lobby]: Lobby;
  [Internal.BoatClicked]: Boat;
  [Internal.MyBoat]: Boat;
  [Internal.Boats]: Boat[];
  [Internal.Scene]: Scene;
  [Internal.SetMap]: string;
  [Internal.Time]: string;
  [Internal.MyMoves]: MoveMessage;

  [Internal.CenterOnBoat]: undefined;
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

  [InCmd.SettingSet]: DBSetting;
  [InCmd.IntentoryOpen]: Inventory;
  [InCmd.InventoryUpdate]: InvUpdate;
  [InCmd.InventoryCoin]: number;

  [InCmd.PlayerAdd]: Message;
  [InCmd.PlayerRemove]: Message;
  [InCmd.PlayerList]: Message[];
  [InCmd.LobbyList]: Lobby[];
  [InCmd.LobbyUpdate]: Lobby;
  [InCmd.LobbyRemove]: number;

  [InCmd.LobbyJoin]: Lobby;
  [InCmd.Sync]: Sync;
  [InCmd.Turn]: Turn;
  [InCmd.Team]: TeamMessage | TeamMessage[];
  [InCmd.Moves]: MoveMessageIncoming[] | MoveMessageIncoming;
  [InCmd.BoatTicks]: Record<number, BoatTick>;
  [InCmd.BoatTick]: BoatTick;
  [InCmd.NewBoat]: BoatSync;
  [InCmd.DelBoat]: number;
  [InCmd.Bomb]: { t: number, m: number };

  [InCmd.OfferBlind]: undefined;
  [InCmd.Over]: undefined;
  [InCmd.Ready]: number;
  [InCmd.Bidding]: number;
  [InCmd.Take]: number;
  [InCmd.PlayTo]: number;
  [InCmd.Cards]: number[];
  [InCmd.Scores]: number[];
  [InCmd.Sit]: Player;
  [InCmd.Card]: { id: number, position: number };
  [InCmd.Playing]: { id: number, quantity: number };
} & InternalData;
