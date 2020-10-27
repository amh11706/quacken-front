import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { SettingsService } from '../settings/settings.service';
import { Lobby } from '../lobby/lobby.component';
import { InCmd, OutCmd } from '../ws-messages';

@Component({
  selector: 'q-lobby-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {
  lobbies: Lobby[] = [];
  private sub = new Subscription();

  constructor(
    public ws: WsService,
    public ss: SettingsService,
    public router: Router,
  ) { }

  async ngOnInit() {
    this.sub.add(this.ws.subscribe(InCmd.LobbyList, lobbies => {
      this.lobbies = lobbies;
    }));
    this.sub.add(this.ws.subscribe(InCmd.LobbyUpdate, update => {
      for (let i = 0; i < this.lobbies.length; i++) {
        const lobby = this.lobbies[i];
        if (update.id === lobby.id) {
          Object.assign(lobby, update);
          return;
        }
      }
      this.lobbies.push(update);
    }));
    this.sub.add(this.ws.subscribe(InCmd.LobbyRemove, id => {
      this.lobbies = this.lobbies.filter(l => l.id !== id);
    }));
    this.sub.add(this.ws.connected$.subscribe(async v => {
      if (!v) return;
      this.ws.send(OutCmd.LobbyListJoin);
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  join(l: any) {
    if (!l.group.publicMode) this.router.navigate(['lobby', l.id]);
    else this.ws.send(OutCmd.LobbyApply, l.id);
  }

}
