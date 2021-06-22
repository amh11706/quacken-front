import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { Settings } from '../../settings/setting/settings';
import { InCmd, Internal } from '../../ws-messages';
import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { WsService } from '../../ws.service';
import { SettingsService, SettingMap } from '../../settings/settings.service';
import { Boat } from './boats/boat';
import { FriendsService } from '../../chat/friends/friends.service';
import { Lobby } from '../lobby.component';

const ownerSettings: (keyof typeof Settings)[] = [
  'startNew', 'publicMode', 'hotEntry', 'hideMoves', 'duckLvl',
  'maxPlayers', 'customMap', 'tileSet', 'structureSet', 'autoGen',
];

export const QuackenDesc = 'Quacken: Sneak or fight your way past the greedy ducks to steal their food and bring it home.';

@Component({
  selector: 'q-quacken',
  templateUrl: './quacken.component.html',
  styleUrls: ['./quacken.component.css'],
})
export class QuackenComponent implements OnInit, OnDestroy {
  private _lobby?: Lobby;
  @Input() set lobby(l: Lobby | undefined) {
    if (!l) return;
    this._lobby = l;
    if (l.map) this.setMapB64(l.map);
    setTimeout(() => this.ws.dispatchMessage({ cmd: Internal.Lobby, data: l }));
  }

  get lobby(): Lobby | undefined {
    return this._lobby;
  }

  map: number[][] = [];
  graphicSettings: SettingMap = { mapScale: { value: 50 }, speed: { value: 10 } };
  controlSettings: SettingMap = { kbControls: { value: 1 } };
  myBoat = new Boat('');
  protected sub = new Subscription();

  protected mapHeight = 52;
  protected mapWidth = 25;

  constructor(
    protected ws: WsService,
    protected ss: SettingsService,
    protected fs: FriendsService,
    protected es: EscMenuService,
  ) {
    this.getSettings();
  }

  ngOnInit(): void {
    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: QuackenDesc } });
    this.ss.getGroup('l/quacken', true);
    this.ss.setLobbySettings(ownerSettings);
    this.es.setLobby(undefined, 'quacken');

    this.sub.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => this.myBoat = b));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.ss.setLobbySettings([]);
    this.fs.allowInvite = false;
    this.ss.admin = true;
    this.es.setLobby();
  }

  async getSettings(): Promise<void> {
    [this.graphicSettings, this.controlSettings] = await Promise.all([
      this.ss.getGroup('graphics'),
      this.ss.getGroup('controls'),
    ]);
  }

  protected setMapB64(map: string): void {
    if (!this.map.length) this.initMap();
    const bString = window.atob(map);
    let i = 0;
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        this.map[y][x] = bString.charCodeAt(i);
        i++;
      }
    }
  }

  protected initMap(): void {
    for (let y = 0; y < this.mapHeight; y++) {
      const row = [];
      for (let x = 0; x < this.mapWidth; x++) {
        row.push(0);
      }
      this.map.push(row);
    }
  }
}
