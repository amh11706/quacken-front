import { Component } from '@angular/core';
import { FriendsService } from '../../chat/friends/friends.service';
import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { SettingList, SettingsService } from '../../settings/settings.service';
import { WsService } from '../../ws.service';
import { CadegooseComponent } from '../cadegoose/cadegoose.component';
import { FgMainMenuComponent } from './fg-main-menu/fg-main-menu.component';

export const FgDesc = 'Flag games: Plant flags in the enemy base to score points!';
const ownerSettings: SettingList = [
  'flagMaxPlayers', 'jobberQuality',
  'flagTurnTime', 'flagTurns',
  'flagHotEntry', 'flagPublicMode',
  'flagSpawnDelay', 'flagMap',
  'flagFishBoats', 'flagAllowGuests',
];

@Component({
  selector: 'q-flaggames',
  templateUrl: './flaggames.component.html',
  styleUrls: ['./flaggames.component.scss'],
})
export class FlaggamesComponent extends CadegooseComponent {
  protected menuComponent = FgMainMenuComponent;
  mapHeight = 41;
  mapWidth = 31;
  protected joinMessage = FgDesc;
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
  ) {
    super(ws, ss, fs, kbs, es);

    this.group = 'l/flaggames';
    this.ss.setLobbySettings(ownerSettings, true, 4);
  }
}
