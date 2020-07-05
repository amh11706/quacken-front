import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { SettingsService, SettingMap } from '../settings/settings.service';
import { Notes } from './notes';

const groups = ['quacken', 'quacken', 'spades'];

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

  lobbies = [];

  created = false;
  settings: SettingMap = {};
  createGroup: SettingMap = {};

  private sub: Subscription;

  constructor(
    public ws: WsService,
    public ss: SettingsService,
    public router: Router,
  ) { }

  async ngOnInit() {
    this.sub = this.ws.subscribe('lobbyList', lobbies => {
      this.lobbies = lobbies;
    });
    this.sub = this.ws.subscribe('lu', update => {
      for (let i = 0; i < this.lobbies.length; i++) {
        const lobby = this.lobbies[i];
        if (update.id === lobby.id) return Object.assign(lobby, update);
      }
      this.lobbies.push(update);
    });
    this.sub = this.ws.subscribe('lr', id => {
      this.lobbies = this.lobbies.filter(l => l.id !== id);
    });
    this.sub.add(this.ws.connected$.subscribe(value => {
      if (value) this.ws.send('lobbyList');
    }));

    this.ws.send('lobbyList');
    this.settings = await this.ss.getGroup('l/create');
    this.changeType();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  async changeType() {
    this.createGroup = await this.ss.getGroup('l/' + groups[this.settings.createType], true);
  }

  join(l: any) {
    if (!l.group.publicMode) this.router.navigate(['lobby', l.id]);
    else this.ws.send('lobbyRequest', l.id);
  }

  createLobby() {
    this.createGroup.createType = this.settings.createType;
    this.ws.send('createLobby', this.createGroup);
    this.created = true;
  }

}
