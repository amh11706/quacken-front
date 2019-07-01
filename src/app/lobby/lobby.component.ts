import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { SettingsService } from '../settings/settings.service';
import { Boat } from './boats/boat';

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
  map: Uint8Array[] = [];
  tileSize = 50;
  speed = 1;
  settings: Map<string, string>;
  showSettings = false;
  wheelDebounce: number;
  myBoat = new Boat('');
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private ws: WsService,
    private setServ: SettingsService,
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
    this.sub.add(this.ws.subscribe('joinLobby', m => this.setMapB64(m.map)));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async getSettings() {
    this.settings = await this.setServ.getGroup('lobby');
    this.tileSize = +this.settings.get('mapScale');
    this.speed = +this.settings.get('speed');
  }

  scroll(e: WheelEvent) {
    if (!e.ctrlKey) return;
    if (e.deltaY < 0) {
      this.tileSize *= 11/10;
      if (this.tileSize > 100) this.tileSize = 100;
    } else {
      this.tileSize *= 10/11;
      if (this.tileSize < 15) this.tileSize = 15;
    }
    this.tileSize = Math.round(this.tileSize);
    e.preventDefault();
    this.saveScale()
  }

  saveScale() {
    clearTimeout(this.wheelDebounce);
    this.wheelDebounce = window.setTimeout(() => {
      this.ws.send('setSetting', { id: 2, value: this.tileSize });
      this.settings.set('mapScale', String(this.tileSize));
    }, 1000);
  }

  saveSpeed() {
    clearTimeout(this.wheelDebounce);
    this.wheelDebounce = window.setTimeout(() => {
      this.ws.send('setSetting', { id: 3, value: this.speed });
      this.settings.set('speed', String(this.speed));
    }, 1000);
  }

  nextBoat(v: string) {
    this.ws.send('setSetting', { id: 1, value: +v });
    this.ws.send('nextBoat', +v);
    this.settings.set('nextBoat', v);
  }

  private setMapB64(map: string) {
    if (!this.map.length) this.initMap();
    const bString = atob(map);
    const temp = new Uint8Array(this.map[0].buffer);
    for (let i = 0; i < 25*52; i++) {
      temp[i] = bString.charCodeAt(i);
    }
  }

  private initMap() {
    const buffer = new ArrayBuffer(25*52);
    let offset = 0;
    for (let y = 0; y < 52; y++) {
      this.map.push(new Uint8Array(buffer, offset, 25));
      offset += 25;
    }
  }

}
