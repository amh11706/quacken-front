import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { SettingName } from '../../settings/setting/settings';
import { InCmd, Internal, OutCmd } from '../../ws/ws-messages';
import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { WsService } from '../../ws/ws.service';
import { SettingsService } from '../../settings/settings.service';
import { Boat } from './boats/boat';
import { FriendsService } from '../../chat/friends/friends.service';
import { Lobby } from '../cadegoose/types';

const ownerSettings: SettingName[] = [
  'startNew', 'publicMode', 'hotEntry', 'hideMoves', 'duckLvl',
  'maxPlayers', 'autoGen',
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
    setTimeout(() => this.ws.dispatchMessage({ cmd: Internal.Lobby, data: l }), 100);
  }

  get lobby(): Lobby | undefined {
    return this._lobby;
  }

  protected group: 'l/quacken' | 'l/cade' | 'l/flaggames' = 'l/quacken';
  map: number[][] = [];
  controlSettings = this.ss.prefetch('controls');
  lobbySettings = this.ss.prefetch(this.group);
  graphicSettings = this.ss.prefetch('graphics');

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
    void this.getSettings();
  }

  ngOnInit(): void {
    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: QuackenDesc, from: '' } });
    this.ss.setLobbySettings(ownerSettings);
    this.es.setLobby(undefined, 'quacken');

    this.sub.add(this.ws.subscribe(Internal.MyBoat, b => this.myBoat = b));
    this.sub.add(this.ws.subscribe(Internal.SetMap, m => this.setMapB64(m)));
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (v) setTimeout(async () => this.lobbySettings = await this.ss.getGroup(this.group, true), 1000);
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.ss.setLobbySettings([]);
    this.fs.allowInvite = false;
    this.ss.admin$.next(true);
    this.es.setLobby();
  }

  async getSettings(): Promise<void> {
    const [graphicSettings, controlSettings] = await Promise.all([
      this.ss.getGroup('graphics'),
      this.ss.getGroup('controls'),
    ]);

    if (graphicSettings.mapScale && graphicSettings.speed) this.graphicSettings = graphicSettings as this['graphicSettings'];
    if (controlSettings.kbControls) this.controlSettings = controlSettings as this['controlSettings'];
    this.sub.add(this.graphicSettings.renderMode?.stream.subscribe(() => {
      setTimeout(() => {
        this.setMapB64(this._lobby?.map || '');
        this.ws.send(OutCmd.Sync);
      }, 0);
    }));
  }

  protected setMapB64(map: string): void {
    if (!this.map.length) this.initMap();
    const bString = window.atob(map);
    let i = 0;
    for (let y = 0; y < this.mapHeight; y++) {
      const row = this.map[y];
      if (!row) break;
      for (let x = 0; x < this.mapWidth; x++) {
        row[x] = bString.charCodeAt(i);
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
