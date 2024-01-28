import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { WsService } from '../ws/ws.service';
import { SettingsService } from '../settings/settings.service';
import { InCmd, OutCmd } from '../ws/ws-messages';
import { Lobby } from './cadegoose/types';

@Component({
  selector: 'q-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
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
  ) { }

  ngOnInit(): void {
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
    }));
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (!v || !this.id) return;
      if (!this.sent) this.ws.send(OutCmd.LobbyJoin, this.id);
      this.sent = true;
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.ss.admin = true;
  }
}
