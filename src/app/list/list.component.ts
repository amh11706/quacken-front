import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { SettingsService, SettingMap } from '../settings/settings.service';
import { Notes } from './notes';
import { Lobby } from '../lobby/lobby.component';
import { InCmd, OutCmd } from '../ws-messages';

const groups = ['quacken', 'quacken', 'spades', 'cade'];

@Component({
  selector: 'q-lobby-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {
  selected = 'list';
  links = [
    { title: 'Lobby List', path: 'list' },
    { title: 'Create Lobby', path: 'create' },
    { title: 'Map Editor', path: 'map' },
    { title: 'Release Notes', path: 'notes' },
  ];
  publicModes = ['Public', 'Public Invitation'];
  notes = Notes;

  lobbies: Lobby[] = [];

  created = false;
  settings: SettingMap = {};
  createGroup: SettingMap = {};

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
    this.sub.add(this.ws.connected$.subscribe(async () => {
      this.ws.send(OutCmd.LobbyListJoin);
      this.settings = await this.ss.getGroup('l/create');
      this.changeType();
    }));

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async changeType() {
    this.createGroup = await this.ss.getGroup('l/' + groups[this.settings.createType], true);
  }

  join(l: any) {
    if (!l.group.publicMode) this.router.navigate(['lobby', l.id]);
    else this.ws.send(OutCmd.LobbyJoin, l.id);
  }

  createLobby() {
    this.createGroup.createType = this.settings.createType;
    this.ws.send(OutCmd.LobbyCreate, this.createGroup);
    this.created = true;
  }

}
