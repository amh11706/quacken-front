import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Boat } from '../quacken/boats/boat';
import { Settings } from 'src/app/settings/setting/settings';
import { QuackenComponent } from '../quacken/quacken.component';
import { SettingMap, SettingsService } from 'src/app/settings/settings.service';
import { InCmd, Internal } from 'src/app/ws-messages';
import { FriendsService } from 'src/app/chat/friends/friends.service';
import { WsService } from 'src/app/ws.service';
import { Turn } from '../quacken/boats/boats.component';
import { EscMenuService } from 'src/app/esc-menu/esc-menu.service';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { KeyBindingService } from 'src/app/settings/key-binding/key-binding.service';
import { KeyActions } from 'src/app/settings/key-binding/key-actions';
import { TwodRenderComponent } from './twod-render/twod-render.component';

const ownerSettings: (keyof typeof Settings)[] = [
  'jobberQuality', 'cadeTurnTime', 'cadePublicMode', 'cadeHotEntry',
  'cadeMaxPlayers', 'cadeMap',
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
  graphicSettings: SettingMap = { mapScale: { value: 50 }, speed: { value: 10 }, water: { value: 1 }, showFps: { value: 0 } };
  controlSettings: SettingMap = { lockAngle: { value: 0 } };
  hoveredTeam = -1;
  statOpacity = 0;
  mapHeight = 36;
  mapWidth = 20;
  protected joinMessage = CadeDesc;
  protected statAction = KeyActions.CShowStats;

  constructor(
    ws: WsService,
    ss: SettingsService,
    fs: FriendsService,
    private kbs: KeyBindingService,
    es: EscMenuService,
  ) {
    super(ws, ss, fs, es);

    this.ss.getGroup('l/cade', true);
  }

  ngOnInit() {
    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: this.joinMessage } });
    this.ss.setLobbySettings(ownerSettings);
    this.es.setLobby(this.menuComponent, this.lobby);
    this.es.open = true;

    this.sub.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => this.myBoat = b));
    this.sub.add(this.ws.subscribe(InCmd.Turn, (t: Turn) => { if (this.lobby) this.lobby.stats = t.stats; }));
    this.sub.add(this.kbs.subscribe(this.statAction, v => this.statOpacity = v ? 1 : 0));
  }

  ngAfterViewInit() {
    this.renderer?.fillMap(this.map, this.lobby?.flags);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  protected setMapB64(map: string) {
    super.setMapB64(map);
    this.renderer?.fillMap(this.map, this.lobby?.flags);
  }

}
