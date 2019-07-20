import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { SettingsService } from '../settings/settings.service';

@Component({
  selector: 'app-lobby-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {
  selected = 'list';
  links = [
    { title: 'Lobby List', path: 'list' },
    { title: 'Create Lobby', path: 'create' },
    { title: 'Map Editor', path: 'map' },
  ];
  publicModes = ['Public', 'Public Invitation'];

  lobbies = [];

  created = false;

  private sub: Subscription;

  constructor(
    public ws: WsService,
    public ss: SettingsService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.sub = this.ws.subscribe('lobbyList', lobbies => this.lobbies = lobbies);

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
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  join(l: any) {
    if (l.group.publicMode === 0) this.router.navigate(['lobby', l.id]);
    else this.ws.send("lobbyRequest", l.id);
  }

  async createLobby() {
    const settings = await this.ss.getGroup('l/quacken');
    this.ws.send('createLobby', settings);
    this.created = true;
  }

}
