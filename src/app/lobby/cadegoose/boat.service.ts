import { Injectable, OnDestroy } from '@angular/core';
import {
  Scene,
  Box3,
  Ray, MeshStandardMaterial, Mesh, DoubleSide, Camera
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { BoatsComponent, BoatSync, Clutter, Turn } from '../quacken/boats/boats.component';
import { ObstacleConfig } from './cadegoose.component';
import { WsService } from 'src/app/ws.service';
import { OutCmd } from 'src/app/ws-messages';
import { Cannonball } from './clutter/cannonball';
import { BoatRender } from './boat-render';

export const flagMats = {
  0: new MeshStandardMaterial({ color: 'green', side: DoubleSide }),
  1: new MeshStandardMaterial({ color: 'darkred', side: DoubleSide }),
  99: new MeshStandardMaterial({ color: '#CDCA97', side: DoubleSide }),
  100: new MeshStandardMaterial({ color: '#333', side: DoubleSide }),
};

const checkSZ = (pos: { x: number, y: number }) => {
  return pos.y > 32 || pos.y < 3;
};

const shipModels: any = {
  22: { path: 'WB', offsetX: 0, offsetZ: 0, offsetY: 0.16, scalar: 0.02, rotate: -Math.PI / 2 },
  24: { path: 'xebec', offsetX: -0.05, offsetZ: 0, offsetY: 0, scalar: 0.015, rotate: Math.PI },
  26: { path: 'WF', offsetX: 0, offsetZ: 0, offsetY: 0.175, scalar: 0.22 },
};

@Injectable()
export class BoatService extends BoatsComponent implements OnDestroy {
  private scene?: Scene;
  private camera?: Camera;
  private controls?: OrbitControls;
  private ships: Record<number, Promise<GLTF>> = {};
  private blockRender = true;
  flags: Mesh[] = [];
  private flagData: { x: number, y: number, t: number, p: number, cs: number[] }[] = [];

  constructor(ws: WsService) {
    super(ws);
    super.ngOnInit();
    BoatRender.updateCam = (br) => this.updateCam(br);

    // this.subs.add(this.ws.subscribe(Internal.Boats, (m: Lobby) => {
    //   this.flagData = m.flags || [];
    // }));
  }

  static dispose(o: any) {
    if (o.geometry) {
      o.geometry.dispose();
    }

    if (o.material) {
      if (o.material.length) {
        for (let i = 0; i < o.material.length; ++i) {
          o.material[i].dispose();
        }
      } else {
        o.material.dispose();
      }
    }

    if (o.children?.length) {
      for (const c of o.children) BoatService.dispose(c);
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    for (const p of Object.values(this.ships)) p.then(s => BoatService.dispose(s.scene));
  }

  async setScene(s: Scene, objGetter: (c: ObstacleConfig) => Promise<GLTF>, cam: Camera) {
    this.scene = s;
    this.camera = cam;

    if (!Object.keys(this.ships).length) {
      for (const [id, config] of Object.entries(shipModels)) {
        this.ships[+id] = objGetter(config as any);
      }

      this.blockRender = false;
    }
    this.updateRender();
  }

  setControls(con: OrbitControls) {
    this.controls = con;
    con.addEventListener('change', () => {
      if (!this.camera) return;
      for (const boat of this.boats) {
        boat.render?.scaleHeader(this.camera);
      }
    });
  }

  protected async setBoats(b: BoatSync[], reset = true) {
    const boats = this.boats;
    super.setBoats(b, reset);
    await this.updateRender(false);
    for (const boat of boats) {
      if (!(this._boats[-boat.id]?.render === boat.render || this._boats[boat.id]?.render === boat.render)) {
        boat.render?.dispose();
        delete boat.render;
        continue;
      }
      boat.checkSZ = checkSZ;
    }
  }

  protected deleteBoat(id: number) {
    super.deleteBoat(id);
    if (!this.turn) this.updateRender();
  }

  protected handleMoves(s: { t: number, m: number[] }) {
    const boat = this._boats[-s.t] || this._boats[s.t];
    if (!boat) return;
    boat.moves = s.m;
    boat.render?.updateMoves();
  }

  protected resetBoats(): void {
    super.resetBoats();
    for (const boat of this.boats) boat.render?.updateMoves();
  }

  protected async handleTurn(turn: Turn) {
    this.flagData = turn.flags;
    this.setHeaderFlags();
    super.handleTurn(turn);
  }

  private setHeaderFlags() {
    if (!this.flags) return;

    for (const boat of this.boats) if (boat.render) boat.render.flags = [];
    for (let i = 0; i < this.flags.length; i++) {
      const f = this.flagData[i];
      if (!f) continue;
      this.flags[i].material = flagMats[f.t as keyof typeof flagMats];
      if (f.cs) for (const id of f.cs) this._boats[id]?.render?.flags.push({ p: f.p, t: f.t });
    }
    for (const boat of this.boats) {
      if (!boat.render) continue;
      boat.render.flags.sort((a, b) => {
        if (a.p > b.p) return -1;
        if (a.p < b.p) return 1;
        return b.t - a.t;
      });
      boat.render.rebuildHeader();
    }
  }

  protected playTurn = async () => {
    const clutterPart = this.turn?.cSteps[this.step] || [];
    const turnPart = this.turn?.steps[this.step] || [];
    for (const u of turnPart) {
      const boat = this._boats[u.id];
      if (!boat) continue;
      if (u.c) boat.addDamage(u.c - 1, u.cd || 0);

      if (u.tm === undefined || u.tf === undefined) continue;
      if (boat.rotateTransition === 0) boat.rotateTransition = 1;
      boat.setPos(u.x, u.y)
        .setTransition(u.tf, u.tm)
        .rotateByMove(u.tm);
    }

    if (this.step === 4) this.resetBoats();

    const turn = this.turn;
    if (this.turn?.steps[this.step]?.length) await this.updateRender();
    if (turn !== this.turn) return;
    this.step++;
    if (this.step < 8) this.animateTimeout = window.setTimeout(this.playTurn, 350 * 20 / this.speed);
    else this.animateTimeout = window.setTimeout(() => this.ws.send(OutCmd.Sync), 750 * 20 / this.speed);
    this.handleUpdate(clutterPart);
  }

  protected handleUpdate(updates: Clutter[]) {
    if (!this.scene) return;
    Cannonball.speed = this.speed;
    for (const u of updates) {
      new Cannonball(this.scene, u).start();
      if (u.dbl) new Cannonball(this.scene, u).start(2000 / this.speed);
    }
  }

  private updateCam(br: BoatRender) {
    if (!this.camera || !this.controls) return;
    if (br.obj.position.x !== BoatRender.myLastPos.x) {
      this.camera.position.x += br.obj.position.x - BoatRender.myLastPos.x;
      this.controls.target.x += br.obj.position.x - BoatRender.myLastPos.x;
      BoatRender.myLastPos.x = br.obj.position.x;
    }
    if (br.obj.position.z !== BoatRender.myLastPos.z) {
      this.camera.position.z += br.obj.position.z - BoatRender.myLastPos.z;
      this.controls.target.z += br.obj.position.z - BoatRender.myLastPos.z;
      BoatRender.myLastPos.z = br.obj.position.z;
    }
  }

  showInfluence(ray: Ray, team: number) {
    if (!this.camera) return;
    const cam = this.camera;
    this.boats.sort((a, b) => {
      if (!a.render) return -1;
      if (!b.render) return 1;
      return a.render.obj.position.distanceToSquared(cam.position) - b.render.obj.position.distanceToSquared(cam.position);
    });
    const box = new Box3();

    if (team >= 0) {
      for (const boat of this.boats) boat.render?.showInfluence(boat.render.team === team);
      return;
    }

    let hovered = 0;
    for (const boat of this.boats) {
      if (!boat.render?.hitbox) continue;
      box.setFromObject(boat.render.hitbox);
      if (ray.intersectsBox(box)) {
        hovered = boat.render.boat.id;
        break;
      }
    }
    for (const boat of this.boats) boat.render?.showInfluence(boat.render?.boat.id === hovered);
  }

  private async updateRender(animate = true) {
    BoatRender.tweens.update(1000000);
    if (this.blockRender) return;
    const startTime = animate ? new Date().valueOf() : 0;
    this.blockRender = true;
    await Promise.all(this.boats.map(b => b.render?.animation));
    this.blockRender = false;

    const animations: Promise<void[]>[] = [];
    for (const boat of this.boats) {
      if (!boat.render) continue;
      const animation = boat.render.update(startTime);
      if (animation) {
        animations.push(animation);
        continue;
      }
      boat.render?.dispose();
      delete boat.render;
    }

    animations.push(this.checkNewShips());
    return Promise.all(animations).then(() => {
      this.controls?.dispatchEvent({ type: 'change', target: null });
    });
  }

  private checkNewShips() {
    const boatUpdates: Promise<void>[] = [];
    for (const boat of this.boats) {
      if (boat.render) continue;
      const prom = this.ships[boat.type] || this.ships[24];
      boatUpdates.push(prom?.then(gltf => {
        let newBoat = this._boats[boat.id];
        if (newBoat.render && boat.render !== newBoat.render) newBoat = this._boats[-boat.id];
        if (!this.camera || !newBoat || newBoat.render) return;
        boat.render = new BoatRender(boat, gltf).scaleHeader(this.camera);
        this.scene?.add(boat.render.obj);
      }));
    }
    return Promise.all(boatUpdates);
  }

}
