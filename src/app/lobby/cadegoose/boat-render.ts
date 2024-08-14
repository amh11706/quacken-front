import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Vector3, Euler } from 'three';
import { Boat } from '../quacken/boats/boat';
import { JobQueue } from './job-queue';
import { Team } from '../quacken/boats/types';

export const TeamColors: Readonly<[number, number, number][]> = [
  [146, 236, 30], // green
  [236, 30, 30], // red
  [255, 165, 0], // orange
  [255, 0, 255], // magenta
  [194, 227, 235], // light blue
];

function headerColor(boat: Boat): string {
  let color = TeamColors[boat.team || 0];
  if (!color) return 'white';
  if (boat.isMe) {
    color = color.map(c => Math.min(c + 50, 255)) as typeof color;
  }
  return `rgb(${color?.join(',')})`;
}

const moveColor = [
  null,
  '#b9cef1',
  '#97c469',
  '#ff9d55',
  '#eee',
  'red',
];

const flagColor: Record<Team, string> = { 0: 'lime', 1: 'red', 2: 'gold', 3: 'magenta', 4: 'white', 99: '', 100: '#666' };

const teamMaterials = [
  new THREE.LineBasicMaterial({ color: 'lime', transparent: true, opacity: 0 }),
  new THREE.LineBasicMaterial({ color: 'red', transparent: true, opacity: 0 }),
  new THREE.LineBasicMaterial({ color: 'gold', transparent: true, opacity: 0 }),
  new THREE.LineBasicMaterial({ color: 'magenta', transparent: true, opacity: 0 }),
];

export const moveEase: any[] = [
  null,
  TWEEN.Easing.Linear.None,
  TWEEN.Easing.Quadratic.In,
  TWEEN.Easing.Quadratic.Out,
  TWEEN.Easing.Linear.None,
];

export class BoatRender {
  private static circle?: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  static tweens = new TWEEN.Group();
  static tweenProgress = 0;
  static paused = false;
  static speed = 10;
  static updateCam: (br: BoatRender) => void;
  static myLastPos = { x: 0, z: 0 };

  obj = new THREE.Group();
  team: Team;
  hitbox?: THREE.LineSegments<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  flags: { p: number, t: Team }[] = [];

  private influence?: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private header = new THREE.Group();
  private title?: THREE.Sprite;
  private headerTex?: THREE.CanvasTexture;
  private headerCtx?: CanvasRenderingContext2D;
  private type: number;
  pos: { x: number, y: number };
  protected rotateDeg: number;
  private name: string;
  private moves: number[];
  private influenceTween: any;
  private tweenTarget = 0;
  private nameTimeout = 0;
  protected worker = new JobQueue();

  constructor(public boat: Boat, gltf: GLTF) {
    this.type = boat.type;
    this.pos = { ...boat.pos };
    this.rotateDeg = boat.face;
    this.name = boat.name;
    this.team = boat.team || 0;
    this.moves = [...boat.moves];

    this.init(boat, gltf);
  }

  protected init(boat: Boat, gltf: GLTF): void {
    if (!BoatRender.circle) {
      const circle = new THREE.EllipseCurve(0, 0, 0.5, 0.5, 0, 2 * Math.PI, false, 0);
      const circleGeo = new THREE.BufferGeometry().setFromPoints(circle.getPoints(50));
      circleGeo.rotateX(-Math.PI / 2);
      circleGeo.translate(0, 0.02, 0);
      BoatRender.circle = new THREE.Line(circleGeo, teamMaterials[0]);
      BoatRender.circle.visible = false;
    }

    this.obj.add(gltf.scene.clone());
    this.obj.position.x = boat.pos.x + 0.5;
    this.obj.position.z = boat.pos.y + 0.5;
    this.obj.rotation.y = -boat.face * Math.PI / 180;

    this.influence = BoatRender.circle.clone();
    this.influence.scale.setScalar(boat.influence * 2);
    this.influence.material = teamMaterials[boat.team ?? 0]?.clone() ?? this.influence.material;
    this.obj.add(this.influence);

    this.obj.add(this.header);
    this.headerCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    this.headerTex = new THREE.CanvasTexture(this.headerCtx.canvas);
    this.title = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.headerTex,
      transparent: true,
      sizeAttenuation: false,
      // depthWrite: false,
    }));
    this.title.renderOrder = 3;
    this.title.scale.y = 0.06;
    this.makeHeader();

    this.hitbox = this.obj.getObjectByName('hitbox') as any;
  }

  dispose(): Promise<void> {
    return this.worker.addJob(() => {
      this.obj.parent?.remove(this.obj);
      this.influence?.material.dispose();
      if (this.title) {
        this.title.geometry.dispose();
        this.title.material.dispose();
        this.title.material.map?.dispose();
      }
    }, false);
  }

  showInfluence(v = true): void {
    if (this.tweenTarget === +v) return;
    this.tweenTarget = +v;
    this.name = this.boat.name;

    if (this.nameTimeout) clearTimeout(this.nameTimeout);
    this.nameTimeout = window.setTimeout(() => {
      if (!this.influence) return;
      if (this.name !== this.boat.title) this.rebuildHeader();

      if (this.influenceTween) {
        this.influenceTween.end();
        TWEEN.remove(this.influenceTween);
      }
      if (this.influence.material.opacity === this.tweenTarget) {
        this.influence.visible = v;
        return;
      }
      if (v) this.influence.visible = true;

      this.influenceTween = new TWEEN.Tween(this.influence.material)
        .to({ opacity: this.tweenTarget }, 200)
        .start(new Date().valueOf())
        .onComplete(() => {
          if (this.influence) this.influence.visible = v;
        });
    }, 200);
  }

  updateMoves(): BoatRender {
    for (let i = 0; i < this.moves.length; i++) {
      if (this.boat.moves[i] !== this.moves[i]) {
        this.rebuildHeader();
        return this;
      }
    }
    return this;
  }

  update(animate = true, trigger?: () => void): Promise<void> | void {
    if (!animate) this.worker.clearJobs();
    const boat = { ...this.boat } as Boat;
    const job = this.worker.addJob(() => {
      trigger?.();
      return this._update(animate, boat);
    });
    if (this.boat.type !== this.type) {
      return;
    }
    return job;
  }

  protected _update(animate: boolean, boat: Boat): Promise<void[]> {
    const startTime = animate ? new Date().valueOf() : 0;
    const promises: Promise<any>[] = [];

    if (!startTime || boat.pos.x !== this.pos.x || boat.pos.y !== this.pos.y || boat.crunchDir !== -1) {
      promises.push(...this.updateBoatPos(startTime, boat.pos.x, boat.pos.y, boat.crunchDir, boat.moveTransition));
    }

    if (!startTime || boat.face !== this.rotateDeg || boat.imageOpacity === 0) {
      promises.push(...this.updateBoatRot(startTime, boat.face, boat.rotateTransition, boat.imageOpacity));
    }

    if (this.team !== boat.team && this.influence) {
      const material = teamMaterials[boat.team ?? 0]?.clone();
      if (material) {
        this.influence.material.dispose();
        this.influence.material = material;
        this.rebuildHeader();
      }
    }

    if (this.name !== boat.name) {
      this.rebuildHeader();
    }
    return Promise.all(promises);
  }

  rebuildHeader(): void {
    if (this.title) this.header.remove(this.title);

    this.makeHeader();
    this.name = this.boat.name;
    this.team = this.boat.team || 0;
    this.moves = [...this.boat.moves];
  }

  scaleHeader(cam: THREE.Camera): BoatRender {
    let scale = (cam.position.distanceTo(this.obj.position) || 16) / 36;
    if (scale > 0.5) {
      this.header.scale.setScalar(0.65 / scale);
      scale = 0.5;
    } else this.header.scale.setScalar(1.3);
    this.header.position.y = 0.6 + scale;
    return this;
  }

  private makeHeader(size = 36): BoatRender {
    const ctx = this.headerCtx;
    if (!ctx) return this;
    ctx.restore();
    const font = `${size}px bold sans-serif`;
    ctx.font = font;

    const width = Math.max(ctx.measureText(this.boat.title).width, 160);
    const height = size + 72;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, width, size);

    ctx.translate(width / 2, size / 2);
    ctx.fillStyle = headerColor(this.boat);
    ctx.fillText(this.boat.title, 0, 0);

    for (let i = 0; i < this.boat.moves.length; i++) {
      const color = moveColor[this.boat.moves[i] || 0];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(-60 + 30 * i, 24, 30, 20);
    }
    ctx.lineWidth = 2;
    ctx.strokeRect(-60, 24, 120, 20);

    if (this.flags.length) {
      ctx.font = font;
      ctx.textAlign = 'left';
      const flagWidth = ctx.measureText(this.flags.reduce((p, c) => p + c.p, '')).width;
      let shownFlags = '';
      for (const f of this.flags) {
        ctx.fillStyle = flagColor[f.t];
        const offset = ctx.measureText(shownFlags).width;
        ctx.fillText(String(f.p), -flagWidth / 2 + offset, 64);
        shownFlags += f.p;
      }
    }

    if (this.headerTex) this.headerTex.needsUpdate = true;
    if (!this.title) return this;
    this.title.scale.x = 0.08 / height * width;
    this.header.add(this.title);
    return this;
  }

  protected updateBoatPos(
    startTime: number, x: number, y: number, crunchDir: number, transitions: number[],
  ): Promise<void>[] {
    if (!this.obj.position.x || !this.obj.position.z) console.log(x, y, this.obj.position, this.boat.name);
    let t: any;
    const decodeX = [0, 0.4, 0, -0.4];
    const decodeY = [-0.4, 0, 0.4, 0];

    const p = [
      new Promise<Vector3 | void>(resolve => {
        const offsetX = decodeX[crunchDir];
        if (startTime && offsetX) {
          new TWEEN.Tween(this.obj.position, BoatRender.tweens)
            .to({ x: x + offsetX + 0.5 }, 5000 / BoatRender.speed)
            .delay(7500 / BoatRender.speed)
            .repeatDelay(500 / BoatRender.speed)
            .repeat(1).yoyo(true)
            .start(startTime)
            .onComplete(resolve);
        } else if (startTime && transitions[0]) {
          t = new TWEEN.Tween(this.obj.position, BoatRender.tweens)
            .easing(moveEase[transitions[0]])
            .to({ x: x + 0.5 }, 10000 / BoatRender.speed)
            .delay(5000 / BoatRender.speed)
            .start(startTime)
            .onComplete(resolve);
        } else {
          resolve();
        }
      }).then(() => {
        this.pos.x = x;
        this.obj.position.setX(this.pos.x + 0.5);
      }),

      new Promise<Vector3 | void>(resolve => {
        const offsetY = decodeY[crunchDir];
        if (startTime && offsetY) {
          new TWEEN.Tween(this.obj.position, BoatRender.tweens)
            .to({ z: y + offsetY + 0.5 }, 5000 / BoatRender.speed)
            .delay(7500 / BoatRender.speed)
            .repeatDelay(500 / BoatRender.speed)
            .repeat(1).yoyo(true)
            .start(startTime)
            .onComplete(resolve);
        } else if (startTime && transitions[1]) {
          t = new TWEEN.Tween(this.obj.position, BoatRender.tweens)
            .easing(moveEase[transitions[1]])
            .to({ z: y + 0.5 }, 10000 / BoatRender.speed)
            .delay(5000 / BoatRender.speed)
            .start(startTime)
            .onComplete(resolve);
        } else {
          resolve();
        }
      }).then(() => {
        this.pos.y = y;
        this.obj.position.setZ(this.pos.y + 0.5);
      }),
    ];

    if (this.boat.isMe && t) {
      BoatRender.myLastPos = { ...this.obj.position };
      t.onUpdate(() => BoatRender.updateCam(this));
    }

    return p;
  }

  protected updateBoatRot(startTime: number, face: number, transition: number, opacity: number): Promise<unknown>[] {
    const promises: Promise<Euler | Vector3>[] = [];

    if (startTime && (transition || !opacity)) {
      promises.push(new Promise(resolve => {
        if (transition === 1) {
          new TWEEN.Tween(this.obj.rotation, BoatRender.tweens)
            .to({ y: -face * Math.PI / 180 }, 9000 / BoatRender.speed)
            .delay(5000 / BoatRender.speed)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start(startTime + 1000 / BoatRender.speed)
            .onComplete(resolve);
        } else {
          new TWEEN.Tween(this.obj.rotation, BoatRender.tweens)
            .to({ y: -face * Math.PI / 180 }, 50000 / BoatRender.speed)
            .delay(30000 / BoatRender.speed)
            .easing(TWEEN.Easing.Quadratic.In)
            .delay(500)
            .start(startTime)
            .onComplete(resolve);
        }
      }));
    } else this.obj.rotation.y = -face * Math.PI / 180;

    if (startTime && transition > 1) {
      promises.push(new Promise(resolve => {
        new TWEEN.Tween(this.obj.position, BoatRender.tweens)
          .to({ y: -5 }, 40000 / BoatRender.speed)
          .delay(30000 / BoatRender.speed)
          .easing(TWEEN.Easing.Quadratic.In)
          .start(startTime)
          .onComplete(resolve);
        new TWEEN.Tween(this.obj.scale, BoatRender.tweens)
          .to({ x: 0, y: 0, z: 0 }, 40000 / BoatRender.speed)
          .delay(35000 / BoatRender.speed)
          .start(startTime);
      }));
    }

    this.rotateDeg = face;
    return promises;
  }
}
