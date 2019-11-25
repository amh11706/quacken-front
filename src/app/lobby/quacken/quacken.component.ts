import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../../ws.service';
import { SettingsService, SettingMap } from '../../settings/settings.service';
import { Boat } from './boats/boat';
import { FriendsService } from '../../chat/friends/friends.service';
import { Lobby } from '../lobby.component';

const baseSettings = ['mapScale', 'speed', 'kbControls'];
const ownerSettings = [
  'startNew', 'publicMode', 'hotEntry', 'hideMoves', 'duckLvl',
  'maxPlayers', 'customMap', 'tileSet', 'structureSet', 'autoGen'
];

@Component({
  selector: 'app-quacken',
  templateUrl: './quacken.component.html',
  styleUrls: ['./quacken.component.css']
})
export class QuackenComponent implements OnInit, OnDestroy {
  @Input() set lobby(l: Lobby) {
    if (!l) return;
    this.setMapB64(l.map);
    setTimeout(() => this.ws.dispatchMessage({ cmd: '_boats', data: l }));
  }
  moveTransitions = [
    '',
    's linear',
    's ease-in',
    's ease-out',
    's linear'
  ];

  titles = ['', 'Cuttle Cake', 'Taco Locker', 'Pea Pod', 'Fried Egg'];
  map: number[][] = [];
  settings: SettingMap = { mapScale: 50, speed: 10, kbControls: 1 };
  wheelDebounce: number;
  myBoat = new Boat('');
  private sub: Subscription;

  constructor(
    private ws: WsService,
    private ss: SettingsService,
    private fs: FriendsService,
  ) {
    this.getSettings();
  }

  ngOnInit() {
    this.ss.getGroup('l/quacken', true);
    this.ss.setLobbySettings([...baseSettings, ...ownerSettings]);

    this.sub = this.ws.subscribe('_myBoat', (b: Boat) => this.myBoat = b);
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    this.ss.setLobbySettings([]);
    this.fs.allowInvite = false;
    this.ss.admin = true;
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
