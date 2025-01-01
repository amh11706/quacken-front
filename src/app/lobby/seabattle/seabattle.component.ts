import { Component, Injector } from '@angular/core';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { CadegooseComponent } from '../cadegoose/cadegoose.component';
import { SbMainMenuComponent } from './sb-main-menu/sb-main-menu.component';
import { FriendsService } from '../../chat/friends/friends.service';
import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { SettingsService } from '../../settings/settings.service';
import { WsService } from '../../ws/ws.service';
import { MainMenuService } from '../cadegoose/main-menu/main-menu.service';
import { BoatsService } from '../quacken/boats/boats.service';

export const SbDesc = 'Sea Battle: Sink the enemy ship to win!';

@Component({
  selector: 'q-seabattle',
  templateUrl: './seabattle.component.html',
  styleUrls: ['./seabattle.component.scss'],
  providers: [MainMenuService],
})
export class SeabattleComponent extends CadegooseComponent {
  protected menuComponent = SbMainMenuComponent;
  mapHeight = 25;
  mapWidth = 25;
  protected joinMessage = SbDesc;
  protected statAction = KeyActions.SBShowStats;
  protected showMapChoice = false;
  moveKeys = {
    0: KeyActions.SBBlank,
    1: KeyActions.SBLeft,
    2: KeyActions.SBForward,
    3: KeyActions.SBRight,
  } as const;

  actions = {
    bombLeft: KeyActions.SBBombLeft,
    bombRight: KeyActions.SBBombRight,
    BombLeftStrict: KeyActions.SBBombLeftStrict,
    BombRightStrict: KeyActions.SBBombRightStrict,
    tokenLeft: KeyActions.Noop,
    tokenRight: KeyActions.Noop,
    prevSlot: KeyActions.SBPrevSlot,
    nextSlot: KeyActions.SBNextSlot,
    ready: KeyActions.Noop,
    back: KeyActions.SBBack,
  };

  constructor(
    ws: WsService,
    ss: SettingsService,
    fs: FriendsService,
    kbs: KeyBindingService,
    es: EscMenuService,
    injector: Injector,
    boats: BoatsService,
  ) {
    super(ws, ss, fs, kbs, es, injector, boats);

    this.ss.setLobbySettings(ss.lAdminSettings, true, 3);
  }

  protected isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight;
  }
}
