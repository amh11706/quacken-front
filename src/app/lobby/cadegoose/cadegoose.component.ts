import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { ComponentType } from '@angular/cdk/portal';
import { SettingList, SettingsService } from '../../settings/settings.service';
import { InCmd, Internal, OutCmd } from '../../ws/ws-messages';
import { FriendsService } from '../../chat/friends/friends.service';
import { WsService } from '../../ws/ws.service';
import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { QuackenComponent } from '../quacken/quacken.component';
import { Boat } from '../quacken/boats/boat';
import { TwodRenderComponent } from './twod-render/twod-render.component';
import { MapTile, MapEditor } from '../../map-editor/types';
import { SettingMap } from '../../settings/types';
import { Turn } from '../quacken/boats/types';

const ownerSettings: SettingList = [
  'cadeMaxPlayers', 'jobberQuality',
  'cadeTurnTime', 'cadeTurns',
  'enableBots', 'botDifficulty',
  'cadeHotEntry', 'cadePublicMode',
  'cadeSpawnDelay', 'cadeMap',
  'cadeTeams', 'cadeShowStats',
  'allowGuests', 'cadeShowMoves',
  'fishBoats',
];

export const CadeDesc = 'Cadesim: Use your ship to contest flags and sink enemy ships in a battle for points.';

@Component({
  selector: 'q-cadegoose',
  templateUrl: './cadegoose.component.html',
  styleUrls: ['./cadegoose.component.scss'],
})
export class CadegooseComponent extends QuackenComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('renderer', { static: false }) renderer?: TwodRenderComponent;
  protected menuComponent = MainMenuComponent as ComponentType<any>;
  private pendingChanges: MapTile[] = [];
  editor: MapEditor = {
    selected: 50,
    selectedTile: {
      undos: [],
      redos: [],
      id: 0,
      type: 0,
      name: '',
      group: 'cgmaps',
      data: [],
      tags: [],
    },
    settingsOpen: false,
  };

  graphicSettings: SettingMap = {
    mapScale: { value: 50 },
    speed: { value: 10 },
    water: { value: 1 },
    showFps: { value: 0 },
    renderMode: { value: -1 },
  };

  controlSettings: SettingMap = { lockAngle: { value: 0 }, kbControls: { value: 0 } };
  hoveredTeam = -1;
  statOpacity = 0;
  mapHeight = 36;
  mapWidth = 20;
  advancedMapOpen = false;
  mapSeed = '';
  private mapDebounce = new Subject<string>();
  private mapDataDebounce = new Subject();
  protected joinMessage = CadeDesc;
  protected statAction = KeyActions.CShowStats;
  protected statExtraAction = KeyActions.CShowExtraStats;
  showExtraStats = false;
  protected showMapChoice = true;

  constructor(
    ws: WsService,
    ss: SettingsService,
    fs: FriendsService,
    private kbs: KeyBindingService,
    es: EscMenuService,
  ) {
    super(ws, ss, fs, es);

    this.group = 'l/cade';
    this.ss.setLobbySettings(ownerSettings, this.showMapChoice);
  }

  ngOnInit(): void {
    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: this.joinMessage, from: '', admin: 0 } });
    this.es.setLobby(this.menuComponent, this.lobby);
    this.es.open$.next(true);

    this.sub.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => {
      this.myBoat = b;
      this.advancedMapOpen = false;
    }));
    this.sub.add(this.ws.subscribe(Internal.SetMap, (m: string) => this.setMapB64(m)));
    this.sub.add(this.ws.subscribe(Internal.OpenAdvanced, () => {
      this.mapSeed = this.lobby?.seed;
      if (this.lobby?.turn === 0) this.advancedMapOpen = !this.advancedMapOpen;
    }));
    this.sub.add(this.ws.subscribe(InCmd.Turn, (t: Turn) => {
      if (this.lobby) this.lobby.stats = t.stats;
      this.advancedMapOpen = false;
    }));
    this.sub.add(this.kbs.subscribe(this.statAction, v => {
      this.showExtraStats = false;
      this.statOpacity = v ? 1 : 0;
    }));
    this.sub.add(this.kbs.subscribe(this.statExtraAction, v => {
      this.showExtraStats = true;
      this.statOpacity = v ? 1 : 0;
    }));
    this.sub.add(this.mapDebounce.pipe(debounceTime(100)).subscribe(seed => {
      this.ws.send(OutCmd.ChatCommand, '/seed ' + seed);
    }));
    this.sub.add(this.mapDataDebounce.pipe(debounceTime(100)).subscribe(() => {
      for (const change of this.pendingChanges) {
        const row = this.map[change.y];
        if (row) row[change.x] = change.v;
      }
      this.pendingChanges = [];
      let bString = '';
      for (const row of this.map) {
        bString = bString.concat(String.fromCharCode(...row));
      }
      this.ws.send(OutCmd.SetMapData, btoa(bString));
    }));
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (v) setTimeout(async () => this.lobbySettings = await this.ss.getGroup(this.group, true), 1000);
    }));
    this.sub.add(this.kbs.subscribe(KeyActions.Redo, v => {
      if (!this.advancedMapOpen) return;
      const tile = this.editor.selectedTile;
      if (v && tile.redos.length) this.undo(tile.redos, tile.undos);
    }));
    this.sub.add(this.kbs.subscribe(KeyActions.Undo, v => {
      if (!this.advancedMapOpen) return;
      const tile = this.editor.selectedTile;
      if (v && tile.undos.length) this.undo(tile.undos, tile.redos);
    }));
  }

  ngAfterViewInit(): void {
    void this.renderer?.fillMap(this.map, this.lobby?.flags);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected setMapB64(map: string): void {
    super.setMapB64(map);
    void this.renderer?.fillMap(this.map, this.lobby?.flags);
    this.editor.selectedTile.data = this.map;
  }

  updateSeed(seed: string): void {
    this.mapDebounce.next(seed);
  }

  undo = (source: MapTile[][], target: MapTile[][]): void => {
    const changes = source.pop();
    const buffer = [];

    if (changes) {
      for (const oldTile of changes) {
        const change = this.setTile(oldTile.x, oldTile.y, oldTile.v);
        if (change) buffer.push(change);
      }
    }

    target.push(buffer);
  };

  setTile(x: number, y: number, v: number): MapTile | void {
    if (x < 0 || x >= this.mapWidth || y < 3 || y > this.mapHeight - 4) return;
    const oldTile = { x, y, v: this.map[y]?.[x] || 0 };
    if (oldTile.v === v) return;
    this.mapDataDebounce.next();
    if (this.pendingChanges.find(t => t.x === x && t.y === y && t.v === v)) return;
    this.pendingChanges.push({ x, y, v });
    return oldTile;
  }
}
