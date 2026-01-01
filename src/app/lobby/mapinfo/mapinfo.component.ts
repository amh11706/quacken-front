import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, Subject, Subscription } from 'rxjs';

import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { SettingsService } from '../../settings/settings.service';
import { Lobby } from '../cadegoose/types';
import { MapTile, MapEditor } from '../../map-editor/types';
import { TwodRenderComponent } from '../cadegoose/twod-render/twod-render.component';
import { MapEditorModule } from '../../map-editor/map-editor.module';
import { TwodRenderModule } from '../cadegoose/twod-render/twod-render.module';
import { CadegooseModule } from '../cadegoose/cadegoose.module';
import { WsService } from '../../ws/ws.service';
import { Internal, OutCmd } from '../../ws/ws-messages';
import { MapInfo, MapinfoHudComponent } from './mapinfo-hud/mapinfo-hud.component';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { MapinfoMenuComponent } from './mapinfo-menu/mapinfo-menu.component';
import { QdragModule } from '../../qdrag/qdrag.module';
import { LobbyType } from '../cadegoose/lobby-type';

interface MapInfoLobby extends Lobby {
  type: LobbyType.mapinfo;
  map: string;
  mapInfo: MapInfo;
}

@Component({
  selector: 'q-mapinfo',
  imports: [MapEditorModule, TwodRenderModule, CadegooseModule, MapinfoHudComponent, QdragModule],
  templateUrl: './mapinfo.component.html',
  styleUrl: './mapinfo.component.scss',
})
export class MapinfoComponent implements OnInit, OnDestroy {
  @ViewChild('renderer', { static: true }) renderer?: TwodRenderComponent;
  @Input() set lobby(lobby: MapInfoLobby) {
    this.setMapB64(lobby.map);
    this.mapInfo = lobby.mapInfo;
  }

  graphicSettings = this.ss.prefetch('graphics');
  advancedMapOpen = true;

  mapInfo = {} as MapInfo;
  private map: number[][] = [];
  private mapHeight = 36;
  private mapWidth = 20;
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

  private subs = new Subscription();
  private mapDataDebounce = new Subject<void>();
  private mapDebounce = new Subject<string>();

  constructor(
    private es: EscMenuService,
    private ss: SettingsService,
    private ws: WsService,
    private kbs: KeyBindingService,
  ) {
    this.ss.setLobbySettings([], true, 2);
    this.ss.admin$.next(true);
    this.es.setLobby(MapinfoMenuComponent);
  }

  ngOnInit(): void {
    this.subs.add(this.ws.subscribe(Internal.OpenAdvanced, () => { this.advancedMapOpen = true; }));
    this.subs.add(this.mapDataDebounce.pipe(debounceTime(100)).subscribe(() => {
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

    this.subs.add(this.kbs.subscribe(KeyActions.Redo, v => {
      if (!this.advancedMapOpen) return;
      const tile = this.editor.selectedTile;
      if (v && tile.redos.length) this.undo(tile.redos, tile.undos);
    }));
    this.subs.add(this.kbs.subscribe(KeyActions.Undo, v => {
      if (!this.advancedMapOpen) return;
      const tile = this.editor.selectedTile;
      if (v && tile.undos.length) this.undo(tile.undos, tile.redos);
    }));

    this.subs.add(this.mapDebounce.pipe(debounceTime(100)).subscribe(seed => {
      this.ws.send(OutCmd.ChatCommand, '/seed ' + seed);
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.es.setLobby(null);
  }

  updateSeed(seed: string): void {
    this.mapDebounce.next(seed);
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

    void this.renderer?.fillMap(this.map, []);
    this.editor.selectedTile.data = this.map;
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

  protected isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.mapWidth && y >= 3 && y < this.mapHeight - 3;
  }

  setTile(x: number, y: number, v: number): MapTile | void {
    if (!this.isInBounds(x, y)) return;
    const oldTile = { x, y, v: this.map[y]?.[x] || 0 };
    if (oldTile.v === v) return;
    this.mapDataDebounce.next();
    if (this.pendingChanges.find(t => t.x === x && t.y === y && t.v === v)) return;
    this.pendingChanges.push({ x, y, v });
    return oldTile;
  }
}
