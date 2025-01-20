import { Injectable } from '@angular/core';
import { WsService } from '../../ws/ws.service';
import { FriendsService } from '../../chat/friends/friends.service';
import { BoatsService } from '../../lobby/quacken/boats/boats.service';
import { ChatService } from '../../chat/chat.service';

// used to share spoofed services with the replay component
@Injectable({
  providedIn: 'root',
})
export class LobbyWrapperService {
  ws?: WsService;
  fs?: FriendsService;
  boats?: BoatsService;
  chat?: ChatService;

  constructor() { }
}
