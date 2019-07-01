import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';

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

  lobbies = [];
  columns = [
    { title: 'Type', property: 'type' },
    { title: 'Name', property: 'name' },
    { title: 'Owner', property: 'owner' },
    { title: 'Players', property: 'players' },
  ];

  created = false;

  private sub: Subscription;

  constructor(
    public ws: WsService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.sub = this.ws.subscribe('lobbyList', lobbies => this.lobbies = Object.values(lobbies));

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

  createLobby() {
    this.ws.send('createLobby');
    this.created = true;
  }

}
