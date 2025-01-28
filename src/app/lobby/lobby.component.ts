import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

import { WsService } from '../ws/ws.service';
import { SettingsService } from '../settings/settings.service';
import { InCmd, OutCmd } from '../ws/ws-messages';
import { LobbyService } from './lobby.service';
import { Lobby } from './cadegoose/types';
import { BoatsService } from './quacken/boats/boats.service';
import { TurnService } from './quacken/boats/turn.service';

@Component({
  selector: 'q-lobby',
  providers: [
    BoatsService,
    TurnService,
  ],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
})
export class LobbyComponent implements OnInit, OnDestroy {
  lobby = new BehaviorSubject<any | undefined>(undefined);
  id?: number;
  private sub = new Subscription();
  private sent = false;

  constructor(
    private route: ActivatedRoute,
    private ws: WsService,
    private ss: SettingsService,
    private lobbyService: LobbyService<Lobby>,
  ) { }

  ngOnInit(): void {
    this.ss.admin$.next(false);
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
      this.lobby.next(l);
      const oldLobby = this.lobbyService.lobby.value;
      if (oldLobby.type === l.type) l = Object.assign(oldLobby, l);
      this.lobbyService.lobby.next(l);
      this.lobbyService.status.next(l.inProgress);
    }));
    this.sub.add(this.ws.subscribe(InCmd.LobbyStatus, s => this.lobbyService.status.next(s)));
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (!v || !this.id) return;
      if (!this.sent) this.ws.send(OutCmd.LobbyJoin, this.id);
      this.sent = true;
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.ss.admin$.next(true);
  }
}
