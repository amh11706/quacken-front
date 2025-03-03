import { Component } from '@angular/core';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { CadegooseComponent, CadeSettings } from '../cadegoose/cadegoose.component';
import { SbMainMenuComponent } from './sb-main-menu/sb-main-menu.component';
import { MainMenuService } from '../cadegoose/main-menu/main-menu.service';
import { SbDesc } from '../cadegoose/lobby-type';

@Component({
  selector: 'q-seabattle',
  templateUrl: './seabattle.component.html',
  styleUrls: ['./seabattle.component.scss'],
  providers: [MainMenuService],
  standalone: false,
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

  protected setType() {
    this.group = 'l/cade';
    this.ss.setLobbySettings(CadeSettings, true, 3);
  }

  protected isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight;
  }
}
