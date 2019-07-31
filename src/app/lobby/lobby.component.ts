import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { SettingsService, SettingMap } from '../settings/settings.service';
import { Boat } from './boats/boat';
import { FriendsService } from '../chat/friends/friends.service';

const baseSettings = ['mapScale', 'speed', 'kbControls'];
const ownerSettings = ['startNew', 'publicMode', 'hotEntry', 'duckLvl', 'maxPlayers', 'customMap', 'tileSet', 'structureSet', 'autoGen'];

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {
  moveTransitions = [
    '',
    's linear',
    's ease-in',
    's ease-out',
    's linear'
  ];

  titles = ['', 'Cuttle Cake', 'Taco Locker', 'Pea Pod', 'Fried Egg'];
  id: number;
  map: number[][] = [];
  settings: SettingMap = { mapScale: 50, speed: 1, kbControls: 1 };
  wheelDebounce: number;
  myBoat = new Boat('');
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private ws: WsService,
    private ss: SettingsService,
    private fs: FriendsService,
  ) {
    this.getSettings();
  }

  ngOnInit() {
    this.sub = this.route.paramMap.subscribe(params => {
      const id = +params.get('id');
      if (this.id === id) return;
      this.id = id;
      this.ws.send('joinLobby', id);
    });
    this.sub.add(this.ws.subscribe('myBoat', boat => this.myBoat = boat));
    this.sub.add(this.ws.connected$.subscribe(value => {
      if (value) this.ws.send('joinLobby', this.id);
    }));
    this.sub.add(this.ws.subscribe('map', map => this.setMapB64(map)));
    this.sub.add(this.ws.subscribe('joinLobby', m => {
      this.setMapB64(m.map);
      this.fs.allowInvite = m.owner === this.ws.user.name;
      if (m.owner !== this.ws.user.name) this.ss.setLobbySettings(baseSettings);
      else this.ss.setLobbySettings([...baseSettings, ...ownerSettings]);
    }));
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    this.ss.setLobbySettings([]);
    this.fs.allowInvite = false;
  }

  async getSettings() {
    this.settings = await this.ss.getGroup('lobby');
  }

  scroll(e: WheelEvent) {
    if (!e.ctrlKey) return;
    if (e.deltaY < 0) {
      this.settings.mapScale *= 21 / 20;
      if (this.settings.mapScale > 100) this.settings.mapScale = 100;
    } else {
      this.settings.mapScale *= 20 / 21;
      if (this.settings.mapScale < 15) this.settings.mapScale = 15;
    }
    this.settings.mapScale = Math.round(this.settings.mapScale);
    e.preventDefault();
    this.saveScale()
  }

  saveScale() {
    clearTimeout(this.wheelDebounce);
    this.wheelDebounce = window.setTimeout(() => {
      this.ss.save({ id: 2, value: this.settings.mapScale, name: 'mapScale', group: 'lobby' });
    }, 1000);
  }

  private setMapB64(map: string) {
    if (!this.map.length) this.initMap();
    const bString = atob(map);
    let i = 0;
    for (let y = 0; y < 52; y++) {
      for (let x = 0; x < 25; x++) {
        this.map[y][x] = bString.charCodeAt(i);
        i++;
      }
    }
  }

  private initMap() {
    for (let y = 0; y < 52; y++) {
      const row = [];
      for (let x = 0; x < 25; x++) {
        row.push(0);
      }
      this.map.push(row);
    }
  }

}
