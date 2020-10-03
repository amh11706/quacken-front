import { Injectable } from '@angular/core';
import TWEEN from '@tweenjs/tween.js';
import {
  Object3D,
  Group,
  Sprite,
  Scene,
  PerspectiveCamera,
  CanvasTexture,
  LinearFilter,
  ClampToEdgeWrapping,
  SpriteMaterial,
  Box3,
  EllipseCurve, Line, BufferGeometry, LineBasicMaterial, Ray, LineSegments, MeshStandardMaterial, Mesh, Side, DoubleSide
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { BoatsComponent, BoatSync, Clutter, Turn } from '../quacken/boats/boats.component';
import { ObstacleConfig } from './cadegoose.component';
import { WsService } from 'src/app/ws.service';
import { OutCmd } from 'src/app/ws-messages';
import { Boat } from '../quacken/boats/boat';
import { Cannonball } from './clutter/cannonball';

export const flagMats = {
  0: new MeshStandardMaterial({ color: 'green', side: DoubleSide }),
  1: new MeshStandardMaterial({ color: 'darkred', side: DoubleSide }),
  99: new MeshStandardMaterial({ color: '#CDCA97', side: DoubleSide }),
  100: new MeshStandardMaterial({ color: '#444', side: DoubleSide }),
};

const checkSZ = (pos: { x: number, y: number }) => {
  return pos.y > 32 || pos.y < 3;
};

function headerColor(boat: Boat): string {
  if (boat.isMe) {
    if (boat.team) return 'red';
    return 'lime';
  }
  if (boat.team) return '#ff6600';
  return '#019901';
}

const moveColor = [,
  '#b9cef1',
  '#97c469',
  '#ff9d55',
  '#eee',
  'red',
];

const moveEase: any[] = [,
  TWEEN.Easing.Linear.None,
  TWEEN.Easing.Quadratic.In,
  TWEEN.Easing.Quadratic.Out,
  TWEEN.Easing.Linear.None,
];

const shipModels: any = {
  22: { path: 'WB', offsetX: 0, offsetZ: 0, offsetY: 0.16, scalar: 0.02, rotate: -Math.PI / 2 },
  24: { path: 'xebec', offsetX: -0.05, offsetZ: 0, offsetY: 0, scalar: 0.015, rotate: Math.PI },
  26: { path: 'WF', offsetX: 0, offsetZ: 0, offsetY: 0.175, scalar: 0.22 },
};

const red = new LineBasicMaterial({ color: 'red', linewidth: 1 });
const green = new LineBasicMaterial({ color: 'lime', linewidth: 1 });

interface BoatRender {
  id: number;
  obj: Object3D;
  header: Group;
  title: Sprite;
  type: number;
  pos: { x: number, y: number };
  rotateDeg: number;
  name: string;
  team: number;
  moves: number[];
  influence: Line;
  hitbox?: LineSegments;
}

@Injectable({
  providedIn: 'root'
})
export class BoatService extends BoatsComponent {
  private boatRenders: BoatRender[] = [];
  private scene?: Scene;
  private getModel?: (c: ObstacleConfig) => Promise<GLTF>;
  private camera?: PerspectiveCamera;
  private controls?: OrbitControls;
  private ships: Record<number, Promise<GLTF>> = {};
  private rendering = true;
  private tweens = new TWEEN.Group();
  private myLastPos = { x: 0, z: 0 };
  private circle = new Line();
  flags: Mesh[] = [];

  constructor(ws: WsService) {
    super(ws);
    super.ngOnInit();

    const circle = new EllipseCurve(0, 0, 0.5, 0.5, 0, 2 * Math.PI, false, 0);
    const circleGeo = new BufferGeometry().setFromPoints(circle.getPoints(50));
    circleGeo.rotateX(-Math.PI / 2);
    circleGeo.translate(0, 0.02, 0);
    this.circle = new Line(circleGeo, green);
  }

  async setScene(s: Scene, objGetter: (c: ObstacleConfig) => Promise<GLTF>, cam: PerspectiveCamera) {
    this.scene = s;
    this.getModel = objGetter;
    this.camera = cam;

    if (!Object.keys(this.ships).length) {
      for (const [id, config] of Object.entries(shipModels)) {
        this.ships[+id] = objGetter(config as any);
      }

      this.rendering = false;
    }
    this.updateRender();
  }

  setControls(con: OrbitControls) {
    this.controls = con;
    con.addEventListener('change', () => {
      if (!this.camera) return;
      for (const br of this.boatRenders) {
        let scale = (this.camera.position.distanceTo(br.obj.position) || 16) / 36;
        if (scale > 0.5) {
          br.header.scale.setScalar(0.5 / scale);
          scale = 0.5;
        } else br.header.scale.setScalar(1);
        br.header.position.y = 0.6 + scale;
      }
    });
  }

  protected setBoats(b: BoatSync[]) {
    super.setBoats(b);
    for (const boat of this.boats) boat.checkSZ = checkSZ;
    this.updateRender();
  }

  protected deleteBoat(id: number) {
    super.deleteBoat(id);
    this.updateRender();
  }

  protected handleMoves(s: { t: number, m: number[] }) {
    const boat = this._boats[s.t];
    if (!boat) return;
    boat.moves = s.m;
    const br = this.boatRenders.find(r => r.id === s.t);
    if (br) for (let i = 0; i < boat.moves.length; i++) {
      if (boat.moves[i] !== br.moves[i]) {
        this.rebuildHeader(boat, br);
        return;
      }
    }
  }

  protected resetBoats(): void {
    super.resetBoats();
    renderLoop:
    for (const br of this.boatRenders) {
      const boat = this._boats[br.id];
      for (let i = 0; i < boat.moves.length; i++) {
        if (boat.moves[i] !== br.moves[i]) {
          this.rebuildHeader(boat, br);
          continue renderLoop;
        }
      }
    }
  }

  protected handleTurn(turn: Turn) {
    for (let i = 0; i < this.flags.length; i++) {
      this.flags[i].material = flagMats[turn.flags[i]?.t as keyof typeof flagMats];
    }

    super.handleTurn(turn);
  }

  protected playTurn = () => {
    const clutterPart = this.turn?.cSteps[this.step] || [];
    setTimeout(() => this.handleUpdate(clutterPart), 10000 / this.speed);
    const turnPart = this.turn?.steps[this.step] || [];
    for (const u of turnPart) {
      const boat = this._boats[u.id];
      if (!boat || u.tm === undefined || u.tf === undefined) continue;

      boat.rotateTransition = 1;
      if (u.c && u.c > 0) boat.addDamage(u.c - 1, u.cd || 0);
      boat.setPos(u.x, u.y)
        .setTransition(u.tf, u.tm)
        .rotateByMove(u.tm);
    }

    if (this.step === 4) this.resetBoats();

    this.step++;
    const delay = (this.turn?.steps[this.step] || this.turn?.cSteps[this.step] ? 750 : 250) * 20 / this.speed;
    if (this.step < 8) this.animateTimeout = window.setTimeout(this.playTurn, delay);
    else this.animateTimeout = window.setTimeout(() => this.ws.send(OutCmd.Sync), 2500);
    if (this.turn?.steps[this.step - 1]?.length) this.updateRender();
  }

  protected handleUpdate(updates: Clutter[]) {
    if (!this.scene) return;
    Cannonball.speed = this.speed;
    for (const u of updates) {
      new Cannonball(this.scene, u).start();
      new Cannonball(this.scene, u).start(2000 / this.speed);
    }
  }

  private makeHeader(boat: Boat, size = 36): Sprite {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return new Sprite();
    const font = `${size}px bold sans-serif`;
    ctx.font = font;

    const width = ctx.measureText(boat.name).width;
    const height = size;
    ctx.canvas.width = width;
    ctx.canvas.height = height + 36;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, width, height);

    ctx.translate(width / 2, height / 2);
    ctx.fillStyle = headerColor(boat);
    ctx.fillText(boat.name, 0, 0);

    for (let i = 0; i < boat.moves.length; i++) {
      const color = moveColor[boat.moves[i]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(-60 + 30 * i, 24, 30, 20);
    }
    ctx.lineWidth = 2;
    ctx.strokeRect(- 60, 24, 120, 20);

    const canvas = ctx.canvas;
    const texture = new CanvasTexture(canvas);
    // because our canvas is likely not a power of 2
    // in both dimensions set the filtering appropriately.
    texture.minFilter = LinearFilter;
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;

    const labelMaterial = new SpriteMaterial({
      map: texture,
      transparent: true,
      sizeAttenuation: false,
    });

    const sprite = new Sprite(labelMaterial);
    sprite.renderOrder = 3;
    sprite.scale.x = 0.03 / height * width;
    sprite.scale.y = 0.06;
    return sprite;
  }

  private updateCam(br: BoatRender) {
    if (!this.camera || !this.controls) return;
    if (br.obj.position.x !== this.myLastPos.x) {
      this.camera.position.x += br.obj.position.x - this.myLastPos.x;
      this.controls.target.x += br.obj.position.x - this.myLastPos.x;
      this.myLastPos.x = br.obj.position.x;
    }
    if (br.obj.position.z !== this.myLastPos.z) {
      this.camera.position.z += br.obj.position.z - this.myLastPos.z;
      this.controls.target.z += br.obj.position.z - this.myLastPos.z;
      this.myLastPos.z = br.obj.position.z;
    }
  }

  showInfluence(ray: Ray, team: number) {
    if (!this.camera) return;
    const cam = this.camera;
    this.boatRenders.sort((a, b) => a.obj.position.distanceToSquared(cam.position) - b.obj.position.distanceToSquared(cam.position));
    const box = new Box3();

    for (const br of this.boatRenders) br.influence.visible = br.team === team;
    if (team >= 0) return;
    for (const br of this.boatRenders) {
      if (!br.hitbox) continue;
      box.setFromObject(br.hitbox);
      if (ray.intersectsBox(box)) {
        br.influence.visible = true;
        return;
      }
    }
  }

  private updateRender() {
    if (this.rendering || !this.scene || !this.getModel || !this.controls) return;
    this.rendering = true;

    this.tweens.update(Infinity);
    const startTime = new Date().valueOf();

    const newRenders: BoatRender[] = [];
    for (const br of this.boatRenders) {
      const boat = this._boats[br.id];
      if (!boat || boat.type !== br.type) {
        this.delBoatRender(br);
        continue;
      }

      if (boat.pos.x !== br.pos.x || boat.pos.y !== br.pos.y || boat.crunchDir !== -1) {
        this.updateBoatPos(boat, br, startTime);
      }

      if (boat.face !== br.rotateDeg || boat.imageOpacity === 0) {
        this.updateBoatRot(boat, br, startTime);
      }

      this.rebuildHeader(boat, br);
      br.influence.material = boat.team ? red : green;
      newRenders.push(br);
      boat.rendered = true;
    }
    this.boatRenders = newRenders;

    this.checkNewShips();
    this.rendering = false;
  }

  private rebuildHeader(boat: Boat, br: BoatRender) {
    let movesChanged = false;
    for (let i = 0; i < 4; i++) {
      if (boat.moves[i] !== br.moves[i]) {
        movesChanged = true;
        break;
      }
    }
    if (!movesChanged && boat.team === br.team && boat.name === br.name) return;

    br.header.remove(br.title);
    br.title.material.dispose();
    br.title.geometry.dispose();

    const name = this.makeHeader(boat);
    br.title = name;
    br.header.add(name);
    br.name = boat.name;
    br.moves = [...boat.moves];
  }

  private delBoatRender(br: BoatRender) {
    this.scene?.remove(br.obj);
    for (const c of br.header.children) {
      if (!(c instanceof Sprite)) continue;
      c.geometry.dispose();
      c.material.dispose();
    }
    console.log('removed boat', br.id);
  }

  private checkNewShips() {
    for (const boat of this.boats) {
      if (!boat.rendered) {
        boat.rendered = true;
        const prom = this.ships[boat.type] || this.ships[24];
        prom?.then(gltf => {
          const boatObj = new Object3D();
          boatObj.add(gltf.scene.clone());
          boatObj.position.x = boat.pos.x + 0.5;
          boatObj.position.z = boat.pos.y + 0.5;
          boatObj.rotation.y = -boat.face * Math.PI / 180;

          const influence = this.circle.clone();
          influence.scale.setScalar(boat.influence);
          influence.material = boat.team ? red : green;
          boatObj.add(influence);

          const header = new Group();
          let scale = (this.camera?.position.distanceTo(boatObj.position) || 16) / 36;
          if (scale > 0.5) {
            header.scale.setScalar(0.5 / scale);
            scale = 0.5;
          } else header.scale.setScalar(1);
          header.position.y = 0.6 + scale;
          boatObj.add(header);
          const name = this.makeHeader(boat);
          header.add(name);

          this.scene?.add(boatObj);
          this.boatRenders.push({
            id: boat.id || 0, obj: boatObj, header, title: name, type: boat.type, moves: [...boat.moves],
            pos: boat.pos, rotateDeg: boat.face, name: boat.name, team: boat.team || 0, influence,
            hitbox: boatObj.getObjectByName('hitbox') as LineSegments,
          });
          console.log('added boat', boat.id);
          boat.rendered = false;
        });
      }
    }
  }

  private updateBoatPos(boat: Boat, br: BoatRender, startTime: number) {
    let t: any;
    const decodeX = [0, 0.4, 0, -0.4];
    const decodeY = [-0.4, 0, 0.4, 0];

    const offsetX = decodeX[boat.crunchDir];
    if (offsetX) {
      this.tweens.add(new TWEEN.Tween(br.obj.position as any)
        .to({ x: br.pos.x + offsetX + 0.5 }, 3000 / this.speed)
        .delay(4000 / this.speed)
        .repeatDelay(500 / this.speed)
        .repeat(1).yoyo(true)
        .start(startTime));

    } else if (boat.moveTransition[0]) {
      t = new TWEEN.Tween(br.obj.position as any)
        .easing(moveEase[boat.moveTransition[0]])
        .to({ x: boat.pos.x + 0.5 }, 10000 / this.speed)
        .start(startTime);
      this.tweens.add(t);
    } else br.obj.position.x = boat.pos.x + 0.5;

    const offsetY = decodeY[boat.crunchDir];
    if (offsetY) {
      this.tweens.add(new TWEEN.Tween(br.obj.position as any)
        .to({ z: br.pos.y + offsetY + 0.5 }, 3000 / this.speed)
        .delay(4000 / this.speed)
        .repeatDelay(500 / this.speed)
        .repeat(1).yoyo(true)
        .start(startTime));

    } else if (boat.moveTransition[1]) {
      t = new TWEEN.Tween(br.obj.position as any)
        .easing(moveEase[boat.moveTransition[1]])
        .to({ z: boat.pos.y + 0.5 }, 10000 / this.speed)
        .start(startTime);
      this.tweens.add(t);
    } else br.obj.position.z = boat.pos.y + 0.5;

    if (boat.isMe && t) {
      this.myLastPos = { ...br.obj.position };
      t.onUpdate(() => this.updateCam(br));
    }

    boat.crunchDir = -1;
    br.pos = boat.pos;
  }

  private updateBoatRot(boat: Boat, br: BoatRender, startTime: number) {
    if (boat.rotateTransition) {
      if (boat.rotateTransition === 1) {
        this.tweens.add(new TWEEN.Tween(br.obj.rotation as any)
          .to({ y: -boat.face * Math.PI / 180 }, 9000 / this.speed)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .start(startTime + 1000 / this.speed));
      } else {
        this.tweens.add(new TWEEN.Tween(br.obj.rotation as any)
          .to({ y: -boat.face * Math.PI / 180 }, 3000)
          .easing(TWEEN.Easing.Quadratic.In)
          .delay(500)
          .start(startTime));
      }
    } else br.obj.rotation.y = -boat.face * Math.PI / 180;

    if (boat.imageOpacity === 0) {
      new TWEEN.Tween(br.obj.position as any)
        .to({ y: -5 }, 5000)
        .delay(2000)
        .easing(TWEEN.Easing.Quadratic.In)
        .start(startTime);
      new TWEEN.Tween(br.obj.scale as any)
        .to({ x: 0, y: 0, z: 0 }, 5000)
        .start(startTime);

      boat.imageOpacity = 1;
    }
    br.rotateDeg = boat.face;
  }

}
