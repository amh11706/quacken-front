import { Component } from '@angular/core';
import { WsService } from '../../ws.service';
import { ChatService } from '../../chat/chat.service';
import { FriendsService } from '../../chat/friends/friends.service';

@Component({
  selector: 'q-lobby-wrapper',
  templateUrl: './lobby-wrapper.component.html',
  styleUrls: ['./lobby-wrapper.component.scss'],
  providers: [WsService, ChatService, FriendsService],
})
export class LobbyWrapperComponent {
  constructor(public ws: WsService, public chat: ChatService, public fs: FriendsService) { }
}
