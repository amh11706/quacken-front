import * as TWEEN from '@tweenjs/tween.js';
import { Clutter } from '../../../../lobby/quacken/boats/boats.component';
import { BoatRender, moveEase } from '../../boat-render';
import { Point } from './gu-boat';

export class MovableClutter implements Clutter {
  id?: number;
  t = 0;
  x = 0;
  y = 0;
  d?: number;
  p?: boolean;
  dir?: number;
  dis?: number;
  dbl?: number;
  tm?: number;
  tf?: number;
  private pos: { x: number, y: number };
  private transitions: [number, number] = [1, 1];
  coords: Point;
  private activeMovement: Promise<void[]> | undefined;

  constructor(c: Clutter) {
    Object.assign(this, c);
    this.coords = new Point().fromPosition(c);
    this.pos = { x: c.x, y: c.y };
    this.setTransitions();
  }

  setTransitions(): void {
    if (this.tm === 2) this.transitions = [1, 1];
    else if (this.tf !== undefined && this.tf % 2) this.transitions = [2, 3];
    else this.transitions = [3, 2];
  }

  updatePos(startTime: number, x: number, y: number): Promise<void[]> {
    if (this.activeMovement) {
      return this.activeMovement.then(() => this.updatePos(startTime, x, y));
    }
    this.setTransitions();
    const p = [
      new Promise<void | { x: number, y: number }>(resolve => {
        if (startTime && this.transitions[0]) {
          new TWEEN.Tween(this.pos, BoatRender.tweens)
            .easing(moveEase[this.transitions[0]])
            .to({ x }, 10000 / BoatRender.speed)
            .delay(3000 / BoatRender.speed)
            .start(startTime)
            .onUpdate(() => this.coords.fromPosition(this.pos))
            .onComplete(resolve);
        } else {
          resolve();
        }
      }).then(() => {
        this.pos = { x, y };
        this.coords.fromPosition(this.pos);
      }),

      new Promise<void | { x: number, y: number }>(resolve => {
        if (startTime && this.transitions[1]) {
          new TWEEN.Tween(this.pos, BoatRender.tweens)
            .easing(moveEase[this.transitions[1]])
            .to({ y }, 10000 / BoatRender.speed)
            .delay(3000 / BoatRender.speed)
            .start(startTime)
            .onUpdate(() => this.coords.fromPosition(this.pos))
            .onComplete(resolve);
        } else {
          resolve();
        }
      }).then(() => {
        this.pos = { x, y };
        this.coords.fromPosition(this.pos);
      }),
    ];

    this.activeMovement = Promise.all(p);
    void this.activeMovement.then(() => delete this.activeMovement);
    return this.activeMovement;
  }
}
