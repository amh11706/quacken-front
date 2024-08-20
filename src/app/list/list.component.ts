import { Component } from '@angular/core';
import { WsService } from '../ws/ws.service';
import { ChatService } from '../chat/chat.service';
import { StatService } from '../esc-menu/profile/stat.service';
import { SettingsService } from '../settings/settings.service';
import { FriendsService } from '../chat/friends/friends.service';
import { EscMenuService } from '../esc-menu/esc-menu.service';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';

@Component({
  selector: 'q-lobby-list',
  providers: [
    WsService, ChatService, StatService, SettingsService, FriendsService, EscMenuService, KeyBindingService,
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
  constructor(ws: WsService) {
    const token = window.localStorage.getItem('token');
    if (!ws.connected && token) ws.connect(token);
    if (token === 'guest') window.addEventListener('beforeunload', () => window.localStorage.removeItem('token'));
  }
}
