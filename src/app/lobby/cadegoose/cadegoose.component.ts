import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { Settings } from '../../settings/setting/settings';
import { SettingsService } from '../../settings/settings.service';
import { InCmd, Internal, OutCmd } from '../../ws-messages';
import { FriendsService } from '../../chat/friends/friends.service';
import { WsService } from '../../ws.service';
import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { Turn } from '../quacken/boats/boats.component';
import { QuackenComponent } from '../quacken/quacken.component';
import { Boat } from '../quacken/boats/boat';
import { TwodRenderComponent } from './twod-render/twod-render.component';

const ownerSettings: (keyof typeof Settings)[] = [
  'cadeMaxPlayers', 'jobberQuality',
  'cadeTurnTime', 'cadeTurns',
  'enableBots', 'botDifficulty',
  'cadeHotEntry', 'cadePublicMode',
  'cadeSpawnDelay', 'cadeMap',
  'cadeTeams',
];

export const CadeDesc = 'Cadesim: Use your ship to contest flags and sink enemy ships in a battle for points.';

@Component({
  selector: 'q-cadegoose',
  templateUrl: './cadegoose.component.html',
  styleUrls: ['./cadegoose.component.scss'],
})
export class CadegooseComponent extends QuackenComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(TwodRenderComponent) renderer?: TwodRenderComponent;
  protected menuComponent = MainMenuComponent;
  graphicSettings = {
    mapScale: { value: 50 },
    speed: { value: 10 },
    water: { value: 1 },
    showFps: { value: 0 },
  };

  controlSettings = { lockAngle: { value: 0 }, kbControls: { value: 0 } };
  hoveredTeam = -1;
  statOpacity = 0;
  mapHeight = 36;
  mapWidth = 20;
  advancedMapOpen = false;
  mapSeed = '';
  private mapDebounce = new Subject();
  protected joinMessage = CadeDesc;
  protected statAction = KeyActions.CShowStats;
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
    void this.ss.getGroup(this.group, true);
  }

  ngOnInit(): void {
    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: this.joinMessage } });
    this.ss.setLobbySettings(ownerSettings, this.showMapChoice);
    this.es.setLobby(this.menuComponent, this.lobby);
    this.es.open = true;

    this.sub.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => this.myBoat = b));
    this.sub.add(this.ws.subscribe(Internal.OpenAdvanced, () => {
      this.mapSeed = this.lobby?.seed;
      this.advancedMapOpen = true;
    }));
    this.sub.add(this.ws.subscribe(InCmd.Turn, (t: Turn) => { if (this.lobby) this.lobby.stats = t.stats; }));
    this.sub.add(this.kbs.subscribe(this.statAction, v => this.statOpacity = v ? 1 : 0));
    this.sub.add(this.mapDebounce.pipe(debounceTime(100)).subscribe(seed => {
      this.ws.send(OutCmd.ChatCommand, '/seed ' + seed);
    }));
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (v) setTimeout(() => this.ss.getGroup(this.group, true), 1000);
    }));
  }

  ngAfterViewInit(): void {
    this.renderer?.fillMap(this.map, this.lobby?.flags);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected setMapB64(map: string): void {
    super.setMapB64(map);
    this.renderer?.fillMap(this.map, this.lobby?.flags);
  }

  updateSeed(seed: string): void {
    this.mapDebounce.next(seed);
  }
}
