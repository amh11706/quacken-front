import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { SettingsService } from '../settings/settings.service';
import { FriendsService } from '../chat/friends/friends.service';
import { Clutter, BoatSync } from './quacken/boats/boats.component';

export interface Lobby {
  owner: boolean;
  players: any[];
  playing?: boolean;
  scores?: number[];
  map?: string;
  boats?: { [key: string]: BoatSync };
  treasure?: number[];
  clutter?: Clutter[];
  turn?: number;
  type: 'HexaQuack' | 'Quacken' | 'Spades';
  [key: string]: any;
}

@Component({
  selector: 'q-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  lobby?: Lobby;
  id?: number;
  private sub = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private ws: WsService,
    private ss: SettingsService,
    private fs: FriendsService,
  ) { }

  ngOnInit() {
    this.ss.admin = false;
    this.sub = this.route.paramMap.subscribe(params => {
      const id = +(params.get('id') || 0);
      if (this.id === id) return;
      this.id = id;
      this.ws.send('joinLobby', id);
    });
    this.sub.add(this.ws.subscribe('joinLobby', l => {
      this.lobby = l;
      if (l.owner) {
        this.fs.allowInvite = true;
        this.ss.admin = true;
      }
    }));
    this.sub.add(this.ws.connected$.subscribe(value => {
      if (value) this.ws.send('joinLobby', this.id);
    }));
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    this.ss.admin = true;
  }

}
