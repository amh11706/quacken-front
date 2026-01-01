import { Component, OnDestroy, inject } from '@angular/core';
import { WsService } from '../../ws/ws.service';
import { ChatService } from '../../chat/chat.service';
import { FriendsService } from '../../chat/friends/friends.service';
import { BoatsService } from '../../lobby/quacken/boats/boats.service';
import { LobbyWrapperService } from './lobby-wrapper.service';
import { TurnService } from '../../lobby/quacken/boats/turn.service';

@Component({
  selector: 'q-lobby-wrapper',
  templateUrl: './lobby-wrapper.component.html',
  styleUrl: './lobby-wrapper.component.scss',
  providers: [WsService, ChatService, FriendsService, BoatsService, TurnService],
  standalone: false,
})
export class ReplayWrapperComponent implements OnDestroy {
  private wrapper = inject(LobbyWrapperService);

  constructor() {
    const ws = inject(WsService);
    const chat = inject(ChatService);
    const fs = inject(FriendsService);
    const boats = inject(BoatsService);
    const wrapper = this.wrapper;

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
