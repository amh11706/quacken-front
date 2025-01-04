import { Component, OnDestroy } from '@angular/core';
import { WsService } from '../../ws/ws.service';
import { ChatService } from '../../chat/chat.service';
import { FriendsService } from '../../chat/friends/friends.service';
import { BoatsService } from '../../lobby/quacken/boats/boats.service';
import { LobbyWrapperService } from './lobby-wrapper.service';
import { TurnService } from '../../lobby/quacken/boats/turn.service';

@Component({
  selector: 'q-lobby-wrapper',
  templateUrl: './lobby-wrapper.component.html',
  styleUrls: ['./lobby-wrapper.component.scss'],
  providers: [WsService, ChatService, FriendsService, BoatsService, TurnService],
})
export class ReplayWrapperComponent implements OnDestroy {
  constructor(
    ws: WsService,
    chat: ChatService,
    fs: FriendsService,
    boats: BoatsService,
    private wrapper: LobbyWrapperService,
  ) {
    wrapper.ws = ws;
    wrapper.fs = fs;
    wrapper.boats = boats;
    wrapper.chat = chat;
  }

  ngOnDestroy() {
    delete this.wrapper.ws;
    delete this.wrapper.fs;
    delete this.wrapper.boats;
    delete this.wrapper.chat;
  }
}
