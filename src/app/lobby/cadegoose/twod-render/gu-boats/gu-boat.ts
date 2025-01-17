import * as TWEEN from '@tweenjs/tween.js';

import { Boat } from '../../../../lobby/quacken/boats/boat';
import { SpriteData, Orientation } from '../sprite';
import { Boats } from './objects';
import { BoatRender3d, TeamColors, moveEase } from '../../boat-render';
import { Team } from '../../../quacken/boats/types';
import { FlagColorOffsets } from './gu-boats.component';
import { JobQueue } from '../../job-queue';

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

export class GuBoat {
  static widthOffset = 19;
  static myTeam: Team = 99;
  static teamImages = new Map<string, Promise<string>>();
  coords: Point;
  pos: { x: number, y: number };
  protected rotateDeg: number;
  rotateAdjust = 0;
  private spriteData?: SpriteData;
  orientation?: Orientation;
  img?: string;
  imgPosition?: string;
  opacity = 1;
  flags: { p: number, t: Team, offset: string }[] = [];
  static hovering = 0;

  private worker = new JobQueue();

  constructor(public boat: Boat) {
    this.pos = { ...boat.pos };
    this.rotateDeg = boat.face;
    this.coords = new Point().fromPosition(boat.pos);
    this.spriteData = Boats[boat.type]?.sail;
    if (!this.spriteData) return;
    this.updateImage();
    void this.updateTeam();
  }

  update(animate = true, trigger?: () => void): Promise<void> {
    // if (!animate) this.worker.clearJobs();
    const boat = { ...this.boat } as Boat;
    const job = this.worker.addJob(() => {
      trigger?.();
      return this._update(animate, boat);
    });
    return job;
  }

  rebuildHeader(): void {
    for (const f of this.flags) {
      const team = f.t === GuBoat.myTeam ? 98 : f.t;
      f.offset = 220 - ((FlagColorOffsets[team] ?? 9) + f.p) * 10 + 'px';
    }
  }

  protected _update(animate: boolean, boat: Boat): Promise<any> {
    const startTime = animate ? new Date().valueOf() : 0;
    if (animate) BoatRender3d.tweenProgress = startTime;
    const promises: Promise<any>[] = [];

    if (!startTime || boat.pos.x !== this.pos.x || boat.pos.y !== this.pos.y ||
      (boat.crunchDir !== -1 && boat.crunchDir < 4)
    ) {
      promises.push(...this.updateBoatPos(startTime, this.pos.x, this.pos.y, boat.crunchDir, boat.moveTransition));
    }

    const sinking = boat.moveLock === 101;
    if (boat.moveLock < 100) {
      this.updateAnimation('sail');
    }
    if (!startTime || boat.face !== this.rotateDeg || sinking) {
      promises.push(...this.updateBoatRot(startTime, boat.face, boat.rotateTransition, sinking ? 0 : 1));
    }
    if (sinking) boat.moveLock++; // prevent multiple sink animations

    if (!startTime) {
      void this.updateTeam();
    }

    return Promise.all(promises);
  }

  private getTeamImage(team: Team, which: string): Promise<string> {
    let prom = GuBoat.teamImages.get(which + team);
    if (prom) return prom;
    const sail = new window.Image();
    sail.src = '/assets/boats/' + which + '.png';
    if (team === 99) {
      prom = Promise.resolve(sail.src);
      GuBoat.teamImages.set(which + team, prom);
      return prom;
    }

    prom = new Promise(resolve => {
      sail.onload = () => {
        const canvas = (document as any).createElement('canvas') as HTMLCanvasElement;
        canvas.width = sail.width;
        canvas.height = sail.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');
        ctx.drawImage(sail, 0, 0);
        const data = ctx.getImageData(0, 0, sail.width, sail.height);
        const bytes = data.data;
        for (let i = 0; i < bytes.length; i += 4) {
          if (bytes[i] === 90 && bytes[i + 1] === 172 && bytes[i + 2] === 222) {
            const color = TeamColors[team];
            if (color) [bytes[i], bytes[i + 1], bytes[i + 2]] = color;
          }
        }
        ctx.putImageData(data, 0, 0);
        canvas.toBlob((blob) => blob && resolve(URL.createObjectURL(blob)));
      };
    });
    GuBoat.teamImages.set(which + team, prom);
    return prom;
  }

  protected get team(): Team {
    if (this.boat.isMe) return 4;
    return this.boat.team === GuBoat.myTeam ? 99 : this.boat.team ?? 99;
  }

  private async updateAnimation(state: 'sail' | 'sink'): Promise<void> {
    this.spriteData = Boats[this.boat.type]?.[state];
    if (!this.spriteData) return;
    this.img = 'url(' + await this.getTeamImage(this.team, this.spriteData.name + '/' + state) + ')';
  }

  public async updateTeam(): Promise<void> {
    if (!this.spriteData) return;
    await new Promise(resolve => setTimeout(resolve));
    this.updateAnimation('sail');
    if (Boats[this.boat.type]?.sink) void this.getTeamImage(this.team, this.spriteData.name + '/sink');
    this.rebuildHeader();
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
          new TWEEN.Tween(this.boat.pos, BoatRender3d.tweens)
            .to({ x: x + offsetX }, 5000 / BoatRender3d.speed)
            .delay(3500 / BoatRender3d.speed)
            .repeatDelay(500 / BoatRender3d.speed)
            .repeat(1).yoyo(true)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.boat.pos))
            .onComplete(resolve);
        } else if (startTime && transitions[0]) {
          new TWEEN.Tween(this.boat.pos, BoatRender3d.tweens)
            .easing(moveEase[transitions[0]])
            .to({ x }, 10000 / BoatRender3d.speed)
            .delay(3000 / BoatRender3d.speed)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.boat.pos))
            .onComplete(resolve);
        } else {
          resolve();
        }
      }).then(() => {
        this.boat.pos = { x, y };
        this.coords?.fromPosition(this.boat.pos);
      }),

      new Promise<void | { x: number, y: number }>(resolve => {
        const offsetY = decodeY[crunchDir];
        if (startTime && offsetY) {
          new TWEEN.Tween(this.boat.pos, BoatRender3d.tweens)
            .to({ y: y + offsetY }, 5000 / BoatRender3d.speed)
            .delay(3500 / BoatRender3d.speed)
            .repeatDelay(500 / BoatRender3d.speed)
            .repeat(1).yoyo(true)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.boat.pos))
            .onComplete(resolve);
        } else if (startTime && transitions[1]) {
          new TWEEN.Tween(this.boat.pos, BoatRender3d.tweens)
            .easing(moveEase[transitions[1]])
            .to({ y }, 10000 / BoatRender3d.speed)
            .delay(3000 / BoatRender3d.speed)
            .start(startTime)
            .onUpdate(() => this.coords?.fromPosition(this.boat.pos))
            .onComplete(resolve);
        } else {
          resolve();
        }
      }).then(() => {
        this.boat.pos = { x, y };
        this.coords?.fromPosition(this.pos);
      }),
    ];

    return p;
  }

  private get frame(): number {
    const degrees = this.normalizeDegrees(this.rotateDeg);
    return (Math.round((degrees + 325) / 22.5)) % 16;
  }

  private updateImage(index?: number): void {
    if (!index) {
      index = this.frame;
      this.rotateAdjust = (this.normalizeDegrees(this.rotateDeg - index * 22.5 + 135) - 180) / 2.7;
      this.rotateAdjust = +this.rotateAdjust.toFixed(2);
    } else {
      this.rotateAdjust = 0;
    }
    const newOrientation = this.spriteData?.orientations[index];
    if (!newOrientation || this.orientation === newOrientation) return;
    this.orientation = newOrientation;
    this.imgPosition = (-this.orientation.x) + 'px ' + (-this.orientation.y) + 'px';
  }

  protected normalizeDegrees(deg: number) { return ((deg % 360) + 360) % 360 }

  protected updateBoatRot(startTime: number, face: number, transition: number, opacity: number): Promise<any>[] {
    const promises: Promise<any>[] = [];
    if (!startTime) {
      this.rotateDeg = face;
      this.updateImage();
      return promises;
    }


    const normalRotate = new TWEEN.Tween(this, BoatRender3d.tweens)
      .easing(TWEEN.Easing.Linear.None)
      .to({ rotateDeg: face }, 8000 / BoatRender3d.speed)
      .delay(3000 / BoatRender3d.speed)
      .start(startTime)
      .onUpdate(() => this.updateImage());

    promises.push(new Promise<void>(resolve => {
      normalRotate.onComplete(() => {
        this.rotateDeg = this.normalizeDegrees(face);
        this.boat.face = this.rotateDeg;
        resolve();
      });
    }));

    if (opacity > 0) return promises;

    // rotate counter clockwise to the nearest straight down position before sinking
    const targetRotation = face < 225 ? 225 - 360 : 225;
    const timePerDegree = 8000 / BoatRender3d.speed / 90;
    const duration = Math.abs(this.rotateDeg - targetRotation) * timePerDegree;
    const sinkLineup = new TWEEN.Tween(this, BoatRender3d.tweens)
      .easing(TWEEN.Easing.Linear.None)
      .to({ rotateDeg: targetRotation }, duration)
      .delay(15000 / BoatRender3d.speed)
      .start(startTime)
      .onUpdate(() => this.updateImage())
      .onComplete(() => {
        this.updateAnimation('sink');
      });

    normalRotate.chain(sinkLineup);

    // sink animation
    const sinkFrame = { frame: 0 };
    const frameTime = 1000 / BoatRender3d.speed;
    sinkLineup.chain(new TWEEN.Tween(sinkFrame, BoatRender3d.tweens)
      .easing(TWEEN.Easing.Linear.None)
      .to({ frame: 49 }, frameTime * 50)
      .onUpdate(() => {
        this.updateImage(Math.round(sinkFrame.frame + 0.5));
      }));

    return promises;
  }
}
