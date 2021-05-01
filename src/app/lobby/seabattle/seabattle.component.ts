import { Component } from '@angular/core';
import { KeyActions } from 'src/app/settings/key-binding/key-actions';
import { BoatService } from '../cadegoose/boat.service';
import { CadegooseComponent } from '../cadegoose/cadegoose.component';
import { SbMainMenuComponent } from './sb-main-menu/sb-main-menu.component';

export const SbDesc = 'Sea Battle: Sink the enemy ship to win!';

@Component({
  selector: 'q-seabattle',
  templateUrl: './seabattle.component.html',
  styleUrls: ['./seabattle.component.scss'],
  providers: [BoatService],
})
export class SeabattleComponent extends CadegooseComponent {
  protected menuComponent = SbMainMenuComponent;
  mapHeight = 25;
  mapWidth = 25;
  protected joinMessage = SbDesc;
  protected statAction = KeyActions.SBShowStats;
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
    prevSlot: KeyActions.SBPrevSlot,
    nextSlot: KeyActions.SBNextSlot,
    ready: KeyActions.Noop,
    back: KeyActions.SBBack,
  };

}
