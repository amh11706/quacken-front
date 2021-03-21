import { Component, OnInit } from '@angular/core';
import { WsService } from 'src/app/ws.service';
import { ChatService } from 'src/app/chat/chat.service';
import { FriendsService } from 'src/app/chat/friends/friends.service';

@Component({
  selector: 'q-lobby-wrapper',
  templateUrl: './lobby-wrapper.component.html',
  styleUrls: ['./lobby-wrapper.component.scss'],
  providers: [WsService, ChatService, FriendsService],
})
export class LobbyWrapperComponent implements OnInit {

  constructor(public ws: WsService, public chat: ChatService, public fs: FriendsService) { }

  ngOnInit(): void {
  }

}
