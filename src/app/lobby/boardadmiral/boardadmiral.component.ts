import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CadegooseComponent } from '../cadegoose/cadegoose.component';
import { DefaultExtraColumns, DefaultStatColumns, MainMenuService } from '../cadegoose/main-menu/main-menu.service';
import { CadegooseModule } from '../cadegoose/cadegoose.module';
import { TwodRenderModule } from '../cadegoose/twod-render/twod-render.module';
import { HudComponent } from './hud/hud.component';
import { BABoatSettings, BaRender, BoatCoverMode, ServerBASettings } from './ba-render';
import { InCmd, Internal, OutCmd } from '../../ws/ws-messages';
import { TileEvent } from '../cadegoose/twod-render/twod-render.component';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { BoatListComponent, DefaultBoat } from './boat-list/boat-list.component';
import { GuBoat } from '../cadegoose/twod-render/gu-boats/gu-boat';
import { Boat } from '../quacken/boats/boat';
import { QdragModule } from '../../qdrag/qdrag.module';
import { MapEditorModule } from '../../map-editor/map-editor.module';
import { Team } from '../quacken/boats/types';
import { BoardadmiralDesc, LobbyStatus } from '../cadegoose/lobby-type';
import { SettingList, SettingsService } from '../../settings/settings.service';
import { Stat } from '../cadegoose/stats/types';
import { FriendsService } from '../../chat/friends/friends.service';
import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { WsService } from '../../ws/ws.service';
import { CadeLobby } from '../cadegoose/types';
import { LobbyService } from '../lobby.service';
import { BoatsService } from '../quacken/boats/boats.service';

export const BASettings: SettingList = [
  'cadeMaxPlayers', 'jobberQuality',
  'cadeTurnTime', 'cadeTurns',
  'cadeSpawnDelay', 'cadeTeams',
  'baships', 'botDifficulty',
  'cadePublicMode', 'cadeHotEntry',
  'cadeShowStats', 'allowGuests',
  'overtime', 'cadeShowMoves',
  'fishBoats', 'cadeShowDamage',
];

interface BaAction {
  cmd: 'addTile' | 'removeTile';
  id: number;
  coverMode: BoatCoverMode;
  data: any;
}

@Component({
  selector: 'q-boardadmiral',
  standalone: true,
  imports: [
    CommonModule,
    CadegooseModule,
    TwodRenderModule,
    HudComponent,
    BoatListComponent,
    QdragModule,
    MatButtonModule,
    MapEditorModule,
  ],
  templateUrl: './boardadmiral.component.html',
  styleUrl: './boardadmiral.component.scss',
  providers: [MainMenuService],

})
export class BoardadmiralComponent extends CadegooseComponent implements OnInit, OnDestroy {
  statColumns = [
    { stat: Stat.PointsScored, title: 'Points Scored' },
    { stat: Stat.CoverageCommands, title: 'Coverage Commands' },
    { stat: Stat.Swaps, title: 'Swaps' },
    { stat: Stat.Copies, title: 'Copies' },
    { stat: Stat.DamageReports, title: 'Damage Reports' },
    { stat: Stat.ShipsSpawned, title: 'Ships Spawned' },
    { stat: Stat.ShipsLost, title: 'Ships Lost' },
    { stat: Stat.UnusedBudget, title: 'Unused Budget' },
  ];

  protected joinMessage = BoardadmiralDesc;
  private render = new BaRender();
  private defaultBoat = new BABoatSettings(DefaultBoat, this.ws);
  activeBoatSettings?: BABoatSettings;
  activeBoat = DefaultBoat;
  boatSettings = new Map<number, BABoatSettings>();
  private boatList: Boat[] = [];

  private undoTicker = 0;
  private lastStatus = LobbyStatus.Waiting;

  constructor(
    ws: WsService,
    ss: SettingsService,
    fs: FriendsService,
    kbs: KeyBindingService,
    es: EscMenuService,
    lobbyService: LobbyService<CadeLobby>,
    injector: Injector,
    boats: BoatsService,
    private ms: MainMenuService,
  ) {
    super(ws, ss, fs, kbs, es, lobbyService, injector, boats);
  }

  protected setType() {
    super.setType();
    this.ss.setLobbySettings(BASettings, this.showMapChoice);
  }

  ngOnInit(): void {
    this.ms.statColumns = this.statColumns;
    this.ms.extraStatColumns = [];
    super.ngOnInit();
    this.bindKeys();
    this.sub.add(this.render.canvasChange$.subscribe(canvas => {
      void this.ws.dispatchMessage({ cmd: Internal.Canvas, data: canvas });
    }));

    this.sub.add(this.ws.subscribe(InCmd.BASettings, s => this.updateBoatSetting(s)));
    this.sub.add(this.ws.subscribe(InCmd.Sync, s => {
      if (s.baData) this.updateBoatSetting(s.baData);
    }));
    // prevent map jumping when switching boats
    this.sub.add(this.boats.myBoat$.subscribe(b => {
      DefaultBoat.pos = { ...b.pos };
      if (b.team !== undefined) this.updateMyTeam(b.team);
    }));
    this.sub.add(this.lobbyService.status.subscribe(s => {
      if (this.lastStatus === LobbyStatus.PreMatch && s !== LobbyStatus.PreMatch) {
        DefaultBoat.team = 99;
        const me = this.lobbyService.lobby.value?.players.find(p => p.sId === this.ws.sId);
        if (me?.t !== undefined) this.updateMyTeam(me.t);
      }
      this.lastStatus = s;
    }));
    this.sub.add(this.fs.lobby$.subscribe(l => {
      const me = l.find(p => p.sId === this.ws.sId);
      if (me?.t !== undefined) this.updateMyTeam(me.t);
    }));
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    DefaultBoat.team = 99;
    this.ms.statColumns = DefaultStatColumns;
    this.ms.extraStatColumns = DefaultExtraColumns;
  }

  private bindKeys() {
    this.sub.add(this.kbs.subscribe(KeyActions.Redo, v => {
      if (!v) return clearInterval(this.undoTicker);
      this.doUndo(this.redos, this.undos);
      this.undoTicker = window.setInterval(() => this.doUndo(this.redos, this.undos), 200);
    }));
    this.sub.add(this.kbs.subscribe(KeyActions.Undo, v => {
      if (!v) return clearInterval(this.undoTicker);
      this.doUndo(this.undos, this.redos);
      this.undoTicker = window.setInterval(() => this.doUndo(this.undos, this.redos), 200);
    }));
  }

  private updateMyTeam(team: Team) {
    if (DefaultBoat.team === team) return;
    DefaultBoat.team = team;
    this.boatSettings.clear();
    this.boats.setMyBoat(DefaultBoat, false);
    this.boats.refreshBoats();
    if (team < 4) {
      void this.ws.request(OutCmd.BASettingsGet).then(s => this.updateBoatSetting(s || []));
    }
  }

  private updateBoatSetting(ss: ServerBASettings | ServerBASettings[]) {
    if (!Array.isArray(ss)) ss = [ss];
    for (const s of ss) {
      const boat = this.boatList.find(b => b.id === s.Id);
      if (!boat) continue;
      const settings = this.boatSettings.get(s.Id) || new BABoatSettings(boat, this.ws);
      this.boatSettings.set(s.Id, settings.fromJSON(s));
    }
    this.redrawOverlay(false);
  }

  activeBoatChange(boat: Boat) {
    this.activeBoat.isMe = false;
    this.activeBoat = boat;
    boat.isMe = true;
    DefaultBoat.isMe = false;
    DefaultBoat.team = GuBoat.myTeam;
    if (DefaultBoat.team === 99) DefaultBoat.team = 4;
    this.boats.setMyBoat(DefaultBoat, false);

    this.activeBoatSettings = this.boatSettings.get(boat.id);
    if (boat === DefaultBoat) delete this.activeBoatSettings;
    this.redrawOverlay(false);
  }

  private undos: BaAction[] = [];
  private redos: BaAction[] = [];

  private doAction(action: BaAction): BaAction | undefined {
    switch (action.cmd) {
      case 'addTile':
        return this.addTile(action.data.x, action.data.y, action.data.a);
      case 'removeTile':
        return this.removeTile(action.data.x, action.data.y);
    }
  }

  doUndo = (undos: BaAction[], redos: BaAction[]) => {
    const action = undos.pop();
    if (!action) return;
    const redo = this.doAction(action);
    if (redo) redos.push(redo);
    this.redrawOverlay();
  };

  redrawOverlay(save = true) {
    this.highlightTile();
    this.render.drawBoats(this.boatSettings, this.activeBoatSettings);
    if (save) this.activeBoatSettings?.save();
  }

  gotBoats(boats: Boat[]): void {
    this.boatList = boats;
    const settings = new Map<number, BABoatSettings>();
    for (const boat of boats) {
      const boatSettings = this.boatSettings.get(boat.id) || new BABoatSettings(boat, this.ws);
      settings.set(boat.id, boatSettings);
    }
    settings.set(0, this.defaultBoat);
    this.boatSettings = settings;
  }

  private findNearestBoat(x: number, y: number): Boat | undefined {
    let minDist = 3;
    let nearest: Boat | undefined;
    for (const boat of this.boatList) {
      // our boat is just there for show
      if (boat.moveLock >= 99) continue;
      const dist = Math.abs(boat.pos.x - x) + Math.abs(boat.pos.y - y);
      if (dist < minDist) {
        minDist = dist;
        nearest = boat;
      }
    }
    return nearest;
  }

  private tileIsSet(x: number, y: number): boolean {
    if (!this.activeBoatSettings) return false;
    return this.activeBoatSettings.getCoverage()
      .some(tile => tile.x === x && tile.y === y);
  }

  private removeTile(x: number, y: number): BaAction | undefined {
    if (!this.activeBoatSettings) return;
    const coverMode = this.activeBoatSettings.coverMode;
    const coverage = this.activeBoatSettings.getCoverage();
    const index = coverage.findIndex(tile => tile.x === x && tile.y === y);
    if (index !== -1) coverage.splice(index, 1);
    return { cmd: 'addTile', data: { x, y }, coverMode, id: this.activeBoat.id };
  }

  private addTile(x: number, y: number, a?: number): BaAction | undefined {
    if (!this.activeBoatSettings) return;
    if (this.tileIsSet(x, y)) return;
    if (this.activeBoatSettings.coverMode === BoatCoverMode.Flags) {
      if (!this.isFlag(x, y)) return;
    }
    if (!this.activeBoatSettings.isCoveragePossible({ x, y })) {
      void this.ws.dispatchMessage({
        cmd: InCmd.ChatMessage,
        data: {
          type: 1,
          from: 'Board Admiral',
          message: 'Invalid coverage. Middle click to clear or right click to select a different boat.',
        },
      });
      return;
    }

    const coverMode = this.activeBoatSettings.coverMode;
    this.activeBoatSettings.getCoverage().push({ x, y, a });
    return { cmd: 'removeTile', data: { x, y }, coverMode, id: this.activeBoat.id };
  }

  private isFlag(x: number, y: number): boolean {
    const tile = this.map?.[y]?.[x] || 0;
    return (tile >= 21 && tile < 24);
  }

  private toggleTile(x: number, y: number, a?: number): void {
    const action = this.tileIsSet(x, y) ? this.removeTile(x, y) : this.addTile(x, y, a);
    if (action) {
      this.undos.push(action);
      this.redrawOverlay();
    }
  }

  private painting = false;
  private paintMode: 'draw' | 'erase' = 'draw';

  hoverTile(e: TileEvent) {
    if (this.activeBoat.id === 0) return;
    if (!this.painting) return;
    const action = this.paintMode === 'erase' ? this.removeTile(e.tile.x, e.tile.y) : this.addTile(e.tile.x, e.tile.y);
    if (action) {
      this.undos.push(action);
      this.redrawOverlay();
    }
  }

  private mouseDownCoords?: { x: number, y: number };

  mouseDownTile(e: TileEvent) {
    this.mouseDownCoords = { x: e.clientX, y: e.clientY };
    if (this.activeBoat.id === 0) return;
    if (!e.ctrlKey) return;
    this.painting = true;
    this.paintMode = this.tileIsSet(e.tile.x, e.tile.y) ? 'erase' : 'draw';
    this.hoverTile(e);
  }

  clickTile(e: TileEvent) {
    if (this.painting) {
      this.painting = false;
      return;
    }
    // ignore drag
    if (Math.abs(e.clientX - this.mouseDownCoords!.x) > 5 || Math.abs(e.clientY - this.mouseDownCoords!.y) > 5) return;
    // right click to select a boat
    if (e.button === 2) {
      const nearest = this.findNearestBoat(e.tile.x, e.tile.y);
      if (!nearest || nearest.id === this.activeBoat.id) this.activeBoatChange(DefaultBoat);
      else this.activeBoatChange(nearest);
      return;
    }
    // shift click or middle click to clear all tiles
    if ((e.shiftKey || e.button === 1) && this.activeBoatSettings) {
      this.activeBoatSettings.clearCoverage();
    }
    this.defaultBoat.selectedTile = e.tile;
    // redraw to update the highlight regardless of if a tile was toggled
    this.redrawOverlay(false);
    this.toggleTile(e.tile.x, e.tile.y);
  }

  highlightedBoats = new Set<number>();

  highlightTile(tile = this.defaultBoat.selectedTile): void {
    this.defaultBoat.selectedTile = tile;
    this.highlightedBoats.clear();
    if (!tile) return;
    this.boatSettings.forEach(settings => {
      const coverage = settings.getCoverage();
      const boat = settings.boat;
      if (tile.x !== boat.pos.x || tile.y !== boat.pos.y) settings.boat.showInfluence = false;
      if (coverage.some(t => t.x === tile.x && t.y === tile.y)) {
        boat.showInfluence = true;
        this.highlightedBoats.add(boat.id);
      }
    });
  }
}
