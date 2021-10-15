import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as TWEEN from '@tweenjs/tween.js';

import { Boat } from '../../../../lobby/quacken/boats/boat';
import { BoatTypes } from '../../../../lobby/quacken/boats/boat-types';
import { SpriteData, Orientation } from '../sprite';
import { Boats } from './objects';
import { BoatRender, moveEase } from '../../boat-render';

// pixel coordinates relative to top left of canvas
export class Point {
  constructor(public x = 0, public y = 0) { }

  project(): Position {
    return new Position().fromPoint(this);
  }

  fromPosition(p: { x: number, y: number }): Point {
    this.x = Math.round((p.y + p.x) * 32);
    this.y = Math.round((p.y - p.x + GuBoat.widthOffset) * 24);
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

const teamColors = [[146, 236, 30], [236, 30, 30]];

export class GuBoat extends BoatRender {
  static widthOffset = 19;
  static myTeam = 99;
  static teamImages = new Map<string, Promise<string>>();
  coords?: Point;
  private spriteData?: SpriteData;
  orientation?: Orientation;
  img?: string;
  imgPosition?: string;
  flags: { p: number, t: number, offset: string }[] = [];
  static hovering = 0;

  constructor(boat: Boat, gltf: GLTF) {
    super(boat, gltf);
  }

  init(boat: Boat): void {
    this.coords = new Point().fromPosition(boat.pos);
    this.spriteData = Boats[boat.type as BoatTypes]?.sail;
    if (!this.spriteData) return;
    this.updateImage();
    void this.updateTeam(boat);
  }

  showInfluence(): void {
    this.boat.renderName = this.boat.title;
  }

  updateMoves(): BoatRender {
    return this;
  }

  protected _update(animate: boolean, boat: Boat): Promise<any> {
    const startTime = animate ? new Date().valueOf() : 0;
    const promises: Promise<any>[] = [];

    if (!startTime || boat.pos.x !== this.pos.x || boat.pos.y !== this.pos.y ||
      (boat.crunchDir !== -1 && boat.crunchDir < 4)
    ) {
      promises.push(...this.updateBoatPos(startTime, boat.pos.x, boat.pos.y, boat.crunchDir, boat.moveTransition));
    }

    if (!startTime || boat.face !== this.rotateDeg || boat.imageOpacity === 0) {
      promises.push(...this.updateBoatRot(startTime, boat.face, boat.rotateTransition, boat.imageOpacity));
    }

    if (!startTime) {
      void this.updateTeam(boat);
    }

    return Promise.all(promises);
  }

  private getTeamImage(team: number, which: string): Promise<string> {
    let prom = GuBoat.teamImages.get(which + team);
    if (prom) return prom;
    const sail = new window.Image();
    sail.src = '/assets/boats/' + which + '.png';
    if (team > 1) {
      prom = Promise.resolve(sail.src);
      GuBoat.teamImages.set(which + team, prom);
      return prom;
    }

    prom = new Promise(resolve => {
      sail.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = sail.width;
        canvas.height = sail.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');
        ctx.drawImage(sail, 0, 0);
        const data = ctx.getImageData(0, 0, sail.width, sail.height);
        const bytes = data.data;
        for (let i = 0; i < bytes.length; i += 4) {
          if (bytes[i] === 90 && bytes[i + 1] === 172 && bytes[i + 2] === 222) {
            [bytes[i], bytes[i + 1], bytes[i + 2]] = teamColors[team];
          }
        }
        ctx.putImageData(data, 0, 0);
        canvas.toBlob(blob => resolve(URL.createObjectURL(blob)));
      };
    });
    GuBoat.teamImages.set(which + team, prom);
    return prom;
  }

  public async updateTeam(boat: Boat): Promise<void> {
    if (!this.spriteData) return;
    await new Promise(resolve => setTimeout(resolve));
    const team = boat.team === GuBoat.myTeam ? 99 : boat.team ?? 99;
    this.img = 'url(' + await this.getTeamImage(team, this.spriteData.name + '/sail') + ')';
    if (Boats[boat.type as BoatTypes]?.sink) void this.getTeamImage(team, this.spriteData.name + '/sink');
  }

  scaleHeader(): BoatRender {
    return this;
  }

  protected updateBoatPos(
    startTime: number, x: number, y: number, crunchDir: number, transitions: number[],
  ): Promise<void>[] {
    const decodeX = [0, 0.4, 0, -0.4];
    const decodeY = [-0.4, 0, 0.4, 0];

    const p = [
      new Promise<void | { x: number, y: number }>(resolve => {
        const offsetX = decodeX[crunchDir];
        if (startTime && offsetX) {
          new TWEEN.Tween(this.pos, BoatRender.tweens)
            .to({ x: x + offsetX }, 5000 / BoatRender.speed)
            .delay(3500 / BoatRender.speed)
            .repeatDelay(500 / BoatRender.speed)
            .repeat(1).yoyo(true)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.pos))
            .onComplete(resolve);
        } else if (startTime && transitions[0]) {
          new TWEEN.Tween(this.pos, BoatRender.tweens)
            .easing(moveEase[transitions[0]])
            .to({ x }, 10000 / BoatRender.speed)
            .delay(3000 / BoatRender.speed)
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

      new Promise<void | { x: number, y: number }>(resolve => {
        const offsetY = decodeY[crunchDir];
        if (startTime && offsetY) {
          new TWEEN.Tween(this.pos, BoatRender.tweens)
            .to({ y: y + offsetY }, 5000 / BoatRender.speed)
            .delay(3500 / BoatRender.speed)
            .repeatDelay(500 / BoatRender.speed)
            .repeat(1).yoyo(true)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.pos))
            .onUpdate(() => console.log)
            .onComplete(resolve);
        } else if (startTime && transitions[1]) {
          new TWEEN.Tween(this.pos, BoatRender.tweens)
            .easing(moveEase[transitions[1]])
            .to({ y }, 10000 / BoatRender.speed)
            .delay(3000 / BoatRender.speed)
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

  private updateImage(index = (Math.round(this.rotateDeg / 22.5) + 46) % 16) {
    const newOrientation = this.spriteData?.orientations[index];
    if (!newOrientation || this.orientation === newOrientation) return;
    this.orientation = newOrientation;
    this.imgPosition = (-this.orientation.x) + 'px ' + (-this.orientation.y) + 'px';
  }

  protected updateBoatRot(startTime: number, face: number, transition: number, opacity: number): Promise<any>[] {
    const promises: Promise<any>[] = [];

    if (startTime && (transition || !opacity)) {
      promises.push(new Promise(resolve => {
        if (transition === 1) {
          new TWEEN.Tween(this, BoatRender.tweens)
            .easing(TWEEN.Easing.Linear.None)
            .to({ rotateDeg: face }, 8000 / BoatRender.speed)
            .delay(3000 / BoatRender.speed)
            .start(startTime)
            .onUpdate(() => this.updateImage())
            .onComplete(resolve);
        } else {
          this.updateImage();
          setTimeout(resolve, 10000 / BoatRender.speed);
        }
      }).then(() => this.rotateDeg = face));
    }

    if (startTime && transition > 1) {
      promises.push(new Promise<void>(resolve => {
        const delay = 2000 / BoatRender.speed;
        const delayOffset = 10000 / BoatRender.speed;
        const f = this.rotateDeg / 90 * 4 + 46;
        // spin left to straight down to line up with first frame of the sink
        for (let i = 1; i < 17; i++) {
          const index = (f + 15 * i) % 16;
          if (index === 8) {
            resolve();
            // swap to sink sprites when facing down
            setTimeout(async () => {
              this.spriteData = Boats[this.boat.type as BoatTypes]?.sink;
              if (!this.spriteData) return;
              const team = this.team === GuBoat.myTeam ? 99 : this.team;
              this.img = 'url(' + await this.getTeamImage(team, this.spriteData.name + '/sink') + ')';
              for (let i2 = 0; i2 < 50; i2++) {
                setTimeout(() => {
                  this.updateImage(i2);
                  if (i2 === 49) this.spriteData = Boats[this.boat.type as BoatTypes]?.sail;
                }, delay / 2 * i2);
              }
            }, delayOffset + delay * i + 1);
            break;
          }

          setTimeout(() => this.updateImage(index), delayOffset + delay * i);
        }
      }));
    }

    if (!startTime) {
      this.rotateDeg = face % 360;
      this.updateImage();
    }

    return promises;
  }
}
