import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { SettingsService } from '../settings/settings.service';
import { FriendsService } from '../chat/friends/friends.service';
import { Clutter } from './quacken/boats/boats.component';
import { InCmd, OutCmd } from '../ws-messages';
import { StatRow } from './cadegoose/stats/stats.component';
import { BoatSync } from './quacken/boats/convert';

export interface Lobby {
  owner: boolean;
  players: any;
  playing?: boolean;
  scores?: number[];
  map?: string;
  boats?: { [key: string]: BoatSync };
  treasure?: number[];
  clutter?: Clutter[];
  turn?: number;
  seconds?: number;
  stats?: Record<number, StatRow>;
  type: 'Quacken' | 'Spades' | 'CadeGoose';
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
  private sent = false;

  constructor(
    private route: ActivatedRoute,
    private ws: WsService,
    private ss: SettingsService,
    private fs: FriendsService,
  ) { }

  ngOnInit() {
    this.ss.admin = false;
    this.sub.add(this.route.paramMap.subscribe(params => {
      if (this.sent) return;
      const id = +(params.get('id') || 0);
      if (this.id === id || !id) return;
      this.id = id;
      this.ws.send(OutCmd.LobbyJoin, id, true);
      this.sent = true;
    }));
    this.sub.add(this.ws.subscribe(InCmd.LobbyJoin, l => {
      this.sent = false;
      this.lobby = l;
      if (l.owner) {
        this.fs.allowInvite = true;
        this.ss.admin = true;
      }
    }));
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (!v) return;
      if (!this.sent) this.ws.send(OutCmd.LobbyJoin, this.id);
      this.sent = true;
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.ss.admin = true;
  }

}
