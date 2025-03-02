import { Component } from '@angular/core';
import { WsService } from '../ws/ws.service';
import { ChatService } from '../chat/chat.service';
import { StatService } from '../esc-menu/profile/stat.service';
import { SettingsService } from '../settings/settings.service';
import { FriendsService } from '../chat/friends/friends.service';
import { EscMenuService } from '../esc-menu/esc-menu.service';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
import { MatchmakingService } from '../esc-menu/match-queue/matchmaking.service';
import { SoundService } from '../sound.service';
import { BoatsService } from '../lobby/quacken/boats/boats.service';
import { TurnService } from '../lobby/quacken/boats/turn.service';
import { LobbyService } from '../lobby/lobby.service';

@Component({
    selector: 'q-lobby-list',
    providers: [
        WsService,
        ChatService,
        StatService,
        SettingsService,
        SoundService,
        FriendsService,
        EscMenuService,
        KeyBindingService,
        MatchmakingService,
        BoatsService,
        TurnService,
        LobbyService,
    ],
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    standalone: false
})
export class ListComponent {
  constructor(
    ws: WsService,
    // make sure services loaded so their subscriptions are active
    public chatService: ChatService,
  ) {
    const token = window.localStorage.getItem('token');
    if (!ws.connected && token) ws.connect(token);
    if (token === 'guest') window.addEventListener('beforeunload', () => window.localStorage.removeItem('token'));
  }
}
