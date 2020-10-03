import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../../ws.service';
import { SettingsService, SettingMap } from '../../settings/settings.service';
import { Boat } from './boats/boat';
import { FriendsService } from '../../chat/friends/friends.service';
import { Lobby } from '../lobby.component';
import { Settings } from 'src/app/settings/setting/settings';
import { InCmd, Internal } from 'src/app/ws-messages';

const baseSettings: (keyof typeof Settings)[] = ['mapScale', 'speed', 'kbControls'];
const ownerSettings: (keyof typeof Settings)[] = [
  'startNew', 'publicMode', 'hotEntry', 'hideMoves', 'duckLvl',
  'maxPlayers', 'customMap', 'tileSet', 'structureSet', 'autoGen'
];

export const QuackenDesc = 'Quacken: Sneak or fight your way past the greedy ducks to steal their food and bring it home.';

@Component({
  selector: 'q-quacken',
  templateUrl: './quacken.component.html',
  styleUrls: ['./quacken.component.css']
})
export class QuackenComponent implements OnInit, OnDestroy {
  private _lobby?: Lobby;
  @Input() set lobby(l: Lobby | undefined) {
    if (!l) return;
    this._lobby = l;
    if (l.map) this.setMapB64(l.map);
    setTimeout(() => this.ws.dispatchMessage({ cmd: Internal.Boats, data: l }));
  }
  get lobby(): Lobby | undefined {
    return this._lobby;
  }

  titles = ['', 'Cuttle Cake', 'Taco Locker', 'Pea Pod', 'Fried Egg'];
  map: number[][] = [];
  settings: SettingMap = { mapScale: 50, speed: 10, kbControls: 1 };
  wheelDebounce?: number;
  myBoat = new Boat('');
  protected sub = new Subscription();

  protected mapHeight = 52;
  protected mapWidth = 25;

  moveTransition = (transition: number): string => {
    switch (transition) {
      case 0: return '0s linear';
      case 1: return 10 / this.settings.speed + 's linear';
      case 2: return 10 / this.settings.speed + 's ease-in';
      case 3: return 10 / this.settings.speed + 's ease-out';
      case 4: return '.1s linear';
      default: return '';
    }
  }

  constructor(
    protected ws: WsService,
    protected ss: SettingsService,
    protected fs: FriendsService,
  ) {
    this.getSettings();
  }

  ngOnInit() {
    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: QuackenDesc } });
    this.ss.getGroup('l/quacken', true);
    this.ss.setLobbySettings([...baseSettings, ...ownerSettings]);

    this.sub.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => this.myBoat = b));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
    this.saveScale();
  }

  saveScale() {
    clearTimeout(this.wheelDebounce);
    this.wheelDebounce = window.setTimeout(() => {
      this.ss.save({ id: 2, value: this.settings.mapScale, name: 'mapScale', group: 'lobby' });
    }, 1000);
  }

  protected setMapB64(map: string) {
    if (!this.map.length) this.initMap();
    const bString = atob(map);
    let i = 0;
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        this.map[y][x] = bString.charCodeAt(i);
        i++;
      }
    }
  }

  protected initMap() {
    for (let y = 0; y < this.mapHeight; y++) {
      const row = [];
      for (let x = 0; x < this.mapWidth; x++) {
        row.push(0);
      }
      this.map.push(row);
    }
  }

}
