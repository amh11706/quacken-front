import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tokens } from '../move-input/move-input.component';

const enum Maneuver {
  Blocked = 0,
  Left = 1,
  Forward = 2,
  Right = 3,
  ChainShot = 4,
  ChainShotGold = 5,
  InPlaceTurn = 8,
  InPlaceTurnGold = 9,
  InPlaceTurnRight = 10,
  InPlaceTurnRightGold = 11,
  DoubleForward = 12,
  DoubleForwardGold = 13,
  Flotsam = 16,
  FlotsamGold = 17,
  Torpedo = 20,
  TorpedoGold = 21,
  BombToken = 24,
  BombTokenGold = 25,
  LongRangeShot = 28,
  LongRangeShotGold = 29,
  DropRock = 32,
  DropRockGold = 33,
  RepairShot = 36,
  RepairShotGold = 37,
  RepairSelf = 40,
  RepairSelfGold = 41,
  DropFlag = 44,
  DropFlagGold = 45,
}

const ManeuverIcons = {
  [Maneuver.Blocked]: './assets/images/arrow0.png',
  [Maneuver.Left]: './assets/images/arrow1.png',
  [Maneuver.Forward]: './assets/images/arrow2.png',
  [Maneuver.Right]: './assets/images/arrow3.png',
  [Maneuver.ChainShot]: './assets/images/arrow4.png',
  [Maneuver.ChainShotGold]: './assets/images/arrow5.png',
  [Maneuver.InPlaceTurn]: './assets/images/arrow8.png',
  [Maneuver.InPlaceTurnGold]: './assets/images/arrow9.png',
  [Maneuver.InPlaceTurnRight]: './assets/images/arrow10.png',
  [Maneuver.InPlaceTurnRightGold]: './assets/images/arrow11.png',
  [Maneuver.DoubleForward]: './assets/images/arrow12.png',
  [Maneuver.DoubleForwardGold]: './assets/images/arrow13.png',
  [Maneuver.Flotsam]: './assets/images/arrow16.png',
  [Maneuver.FlotsamGold]: './assets/images/arrow17.png',
  [Maneuver.Torpedo]: './assets/images/arrow12.png',
  [Maneuver.TorpedoGold]: './assets/images/arrow13.png',
  [Maneuver.BombToken]: './assets/images/arrow4.png',
  [Maneuver.BombTokenGold]: './assets/images/arrow5.png',
  [Maneuver.LongRangeShot]: './assets/images/arrow4.png',
  [Maneuver.LongRangeShotGold]: './assets/images/arrow5.png',
  [Maneuver.DropRock]: './assets/images/arrow4.png',
  [Maneuver.DropRockGold]: './assets/images/arrow5.png',
  [Maneuver.RepairShot]: './assets/images/arrow4.png',
  [Maneuver.RepairShotGold]: './assets/images/arrow5.png',
  [Maneuver.RepairSelf]: './assets/images/arrow12.png',
  [Maneuver.RepairSelfGold]: './assets/images/arrow13.png',
  [Maneuver.DropFlag]: './assets/images/obstacle21.png',
  [Maneuver.DropFlagGold]: './assets/images/obstacle22.png',
};

export function getManeuverIcon(id: number): string {
  return ManeuverIcons[id as Maneuver] || ManeuverIcons[Maneuver.Blocked];
}

@Component({
  selector: 'q-maneuver-source',
  templateUrl: './maneuver-source.component.html',
  styleUrls: ['./maneuver-source.component.scss'],
})
export class ManeuverSourceComponent {
  @Input() dragContext = { source: 8, move: 0, type: 'move' };
  @Input() maneuvers = [
    { id: 4, class: 'move bombtoken', name: 'Chain Shot' },
    { id: 8, class: 'move', name: 'In-place Turn', directional: true },
    { id: 12, class: 'move', name: 'Double Forward' },
    { id: 16, class: 'move', name: 'Flotsam' },
  ];

  @Input() unusedTokens: Tokens = {
    moves: [0, 0, 0],
    shots: 0,
    maneuvers: [0, 0, 0, 0],
  };

  @Input() wantManeuver = 0;
  @Output() wantManeuverChange = new EventEmitter<number>();
  getManeuverIcon = getManeuverIcon;

  setWantToken(i: number): void {
    this.wantManeuver = i;
    this.wantManeuverChange.emit(i);
  }

  dragManeuver(token: number): void {
    this.dragContext.move = token;
    this.dragContext.source = 8;
    const floored = Math.floor(token / 4) * 4;
    this.dragContext.type = this.maneuvers.find((m) => m.id === floored)?.class === 'move' ? 'move' : 'shot';
  }
}
