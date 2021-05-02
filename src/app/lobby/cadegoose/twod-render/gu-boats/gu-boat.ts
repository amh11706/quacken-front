import { BoatRender, moveEase } from '../../boat-render';
import { Boat } from 'src/app/lobby/quacken/boats/boat';
import { BoatTypes } from 'src/app/lobby/quacken/boats/boat-types';
import { SpriteData, Orientation } from '../sprite';
import { Boats } from './objects';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as TWEEN from '@tweenjs/tween.js';

// pixel coordinates relative to top left of canvas
export class Point {
  constructor(public x = 0, public y = 0) { }

  project(): Position {
    return new Position().fromPoint(this);
  }

  fromPosition(p: { x: number, y: number }): Point {
    this.x = (p.y + p.x) * 32;
    this.y = (p.y - p.x + GuBoat.widthOffset) * 24;
    return this;
  }
}

// grid coordinates relative to top left of map
export class Position {
  constructor(public x = 0, public y = 0) { }

  unproject(): Point {
    return new Point().fromPosition(this);
  }

  fromPoint(p: { x: number, y: number }): Position {
    this.x = p.x / 64 - p.y / 48 + GuBoat.widthOffset / 2;
    this.y = p.x / 64 + p.y / 48 - GuBoat.widthOffset / 2;
    return this;
  }
}

export class GuBoat extends BoatRender {
  static widthOffset = 19;
  coords?: Point;
  private spriteData?: SpriteData;
  orientation?: Orientation;
  img?: string;
  imgPosition?: string;
  flags: { p: number, t: number, offset: string }[] = [];

  constructor(boat: Boat, gltf: GLTF) {
    super(boat, gltf);
  }

  init(boat: Boat) {
    this.coords = new Point().fromPosition(boat.pos);
    this.spriteData = Boats[boat.type as BoatTypes]?.sail;
    if (!this.spriteData) return;
    this.updateImage();
    this.img = 'url("/assets/boats/' + this.spriteData.name + '/sail.png")';
  }

  dispose() {
    return this.worker.addJob(() => {

    }, false);
  }

  showInfluence(v = true): void {
    this.boat.renderName = v ? this.boat.title : this.boat.name;
  }

  updateMoves(): BoatRender {
    return this;
  }

  protected _update(animate: boolean, boat: Boat) {
    const startTime = animate ? new Date().valueOf() : 0;
    const promises: Promise<any>[] = [];

    promises.push(...this.updateBoatPos(startTime, boat.pos.x, boat.pos.y, boat.crunchDir, boat.moveTransition));

    if (!startTime || boat.face !== this.rotateDeg || boat.imageOpacity === 0) {
      promises.push(...this.updateBoatRot(startTime, boat.face, boat.rotateTransition, boat.imageOpacity));
    }

    if (this.team !== boat.team) {
    }

    return Promise.all(promises);
  }

  rebuildHeader() {

  }

  scaleHeader(): BoatRender {
    return this;
  }

  protected updateBoatPos(startTime: number, x: number, y: number, crunchDir: number, transitions: number[]) {
    let t: any;
    const decodeX = [0, 0.4, 0, -0.4];
    const decodeY = [-0.4, 0, 0.4, 0];

    const p = [
      new Promise<any>(resolve => {
        const offsetX = decodeX[crunchDir];
        if (startTime && offsetX) {
          new TWEEN.Tween(this.pos, BoatRender.tweens)
            .to({ x: x + offsetX }, 5000 / BoatRender.speed)
            .delay(7500 / BoatRender.speed)
            .repeatDelay(500 / BoatRender.speed)
            .repeat(1).yoyo(true)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.pos))
            .onComplete(resolve);

        } else if (startTime && transitions[0]) {
          t = new TWEEN.Tween(this.pos, BoatRender.tweens)
            .easing(moveEase[transitions[0]])
            .to({ x }, 10000 / BoatRender.speed)
            .delay(7000 / BoatRender.speed)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.pos))
            .onComplete(resolve);
        } else {
          resolve();
        }
      }).then(() => {
        this.pos = { x, y };
        this.coords?.fromPosition(this.pos);
      }),

      new Promise<any>(resolve => {
        const offsetY = decodeY[crunchDir];
        if (startTime && offsetY) {
          new TWEEN.Tween(this.pos, BoatRender.tweens)
            .to({ y: y + offsetY }, 5000 / BoatRender.speed)
            .delay(7500 / BoatRender.speed)
            .repeatDelay(500 / BoatRender.speed)
            .repeat(1).yoyo(true)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.pos))
            .onUpdate(() => console.log)
            .onComplete(resolve);

        } else if (startTime && transitions[1]) {
          t = new TWEEN.Tween(this.pos, BoatRender.tweens)
            .easing(moveEase[transitions[1]])
            .to({ y }, 10000 / BoatRender.speed)
            .delay(7000 / BoatRender.speed)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.pos))
            .onComplete(resolve);
        } else {
          resolve();
        }
      }).then(() => {
        this.pos = { x, y };
        this.coords?.fromPosition(this.pos);
      }),
    ];

    return p;
  }

  private updateImage(index = (this.boat.face / 90 * 4 + 46) % 16) {
    this.orientation = this.spriteData?.orientations[index] || {} as Orientation;
    this.imgPosition = (-this.orientation.x) + 'px ' + (-this.orientation.y) + 'px';
  }

  protected updateBoatRot(startTime: number, face: number, transition: number, opacity: number) {
    const promises: Promise<any>[] = [];

    if (startTime && (transition || !opacity)) {
      promises.push(new Promise(resolve => {
        if (transition === 1) {
          const delay = 2000 / BoatRender.speed;
          const delayOffset = 7000 / BoatRender.speed;
          const offset = this.rotateDeg < face ? 1 : 15;
          const f = this.rotateDeg / 90 * 4 + 14;
          for (let i = 1; i < 5; i++) {
            const index = (f + offset * i) % 16;
            setTimeout(() => {
              this.updateImage(index);
            }, delayOffset + delay * i);
          }
          setTimeout(resolve, 10000 / BoatRender.speed);
        } else {
          this.updateImage();
          setTimeout(resolve, 10000 / BoatRender.speed);
        }
      }).then(() => this.rotateDeg = face));
    } else {
      this.rotateDeg = face % 360;
      this.updateImage();
    }

    if (startTime && transition > 1) {
      promises.push(new Promise(resolve => {
        const delay = 2000 / BoatRender.speed;
        const delayOffset = 5000 / BoatRender.speed;
        const f = this.rotateDeg / 90 * 4 + 46;
        // spin left to straight down to line up with first frame of the sink
        for (let i = 1; i < 17; i++) {
          const index = (f + 15 * i) % 16;
          if (index === 8) {
            // swap to sink sprites when facing down
            setTimeout(() => {
              this.spriteData = Boats[this.boat.type as BoatTypes]?.sink;
              if (!this.spriteData) return resolve();
              this.img = 'url("/assets/boats/' + this.spriteData.name + '/sink.png")';
              for (let i2 = 0; i2 < 50; i2++) {
                setTimeout(() => {
                  this.updateImage(i2);
                  if (i2 === 49) resolve();
                }, delay / 2 * i2);
              }
            }, delayOffset + delay * i + 1);
            break;
          }

          setTimeout(() => this.updateImage(index), delayOffset + delay * i);
        }
      }));
    }

    return promises;
  }
}
