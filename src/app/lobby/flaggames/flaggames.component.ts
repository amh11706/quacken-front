import { Component } from '@angular/core';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { SettingList } from '../../settings/settings.service';
import { CadegooseComponent } from '../cadegoose/cadegoose.component';
import { FgColumns, FgMainMenuComponent } from './fg-main-menu/fg-main-menu.component';
import { MapTile } from '../../map-editor/types';
import { MainMenuService } from '../cadegoose/main-menu/main-menu.service';
import { FgDesc } from '../cadegoose/lobby-type';

const ownerSettings: SettingList = [
  'flagMaxPlayers', 'flagJobberQuality',
  'flagTurnTime', 'flagTurns',
  'flagPublicMode', 'flagHotEntry',
  'flagSpawnDelay', 'flagFishBoats',
  'flagAllowGuests', 'flagRespawn',
  'flagSteal',
];

@Component({
    selector: 'q-flaggames',
    templateUrl: './flaggames.component.html',
    styleUrls: ['./flaggames.component.scss'],
    providers: [MainMenuService],
    standalone: false
})
export class FlaggamesComponent extends CadegooseComponent {
  columns = FgColumns;
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
    ready: KeyActions.SBReady,
    back: KeyActions.SBBack,
  };

  checkSZ = (pos: { x: number, y: number }): boolean => {
    return pos.y < 3 || pos.y > this.mapHeight - 4;
  };

  protected setType() {
    this.group = 'l/flaggames';
    this.ss.setLobbySettings(ownerSettings, true, 4);
  }

  private redrawDebounce = 0;

  setTile(x: number, y: number, v: number): MapTile | void {
    if (this.advancedMapOpen) return super.setTile(x, y, v);
    if (this.lobby?.inProgress) return; // Don't allow clutter based editing before the game starts.

    const row = this.map[y];
    if (!row) return;
    row[x] = v;
    window.clearTimeout(this.redrawDebounce);
    this.redrawDebounce = window.setTimeout(() => {
      void this.renderer?.fillMap(this.map, this.lobby?.flags || []);
    }, 100);
  }
}
