import { Injectable, OnDestroy } from '@angular/core';
import {
  Scene,
  Box3,
  Ray, MeshStandardMaterial, Mesh, DoubleSide, Camera
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { BoatsComponent, Clutter, Turn } from '../quacken/boats/boats.component';
import { WsService } from 'src/app/ws.service';
import { OutCmd, Internal } from 'src/app/ws-messages';
import { Cannonball } from './clutter/cannonball';
import { BoatRender } from './boat-render';
import { JobQueue } from './job-queue';
import { BoatSync, BoatStatus } from '../quacken/boats/convert';
import { ObstacleConfig } from './threed-render/threed-render.component';

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
  protected blockRender = true;
  flags: Mesh[] = [];
  private flagData: { x: number, y: number, t: number, p: number, cs: number[] }[] = [];
  private worker = new JobQueue();

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
    this.renderSync();
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

  protected setBoats(b: BoatSync[], reset = true) {
    const supSet = super.setBoats.bind(this);
    if (reset) {
      this.worker.clearJobs();
    }
    this.worker.addJob(async () => {
      const boats = this.boats;
      supSet(b, reset);
      if (reset) await this.renderSync();
      else await Promise.all(this.checkNewShips());

      for (const boat of boats) {
        if (!(this._boats[-boat.id]?.render === boat.render || this._boats[boat.id]?.render === boat.render)) {
          boat.render?.dispose();
          delete boat.render;
          continue;
        }
        boat.checkSZ = checkSZ;
      }
    });
  }

  protected deleteBoat(id: number) {
    const supDelete = super.deleteBoat.bind(this);
    this.worker.addJob(() => {
      const boat = this._boats[id];
      if (boat?.render) {
        const render = boat.render;
        render.dispose().then(() => {
          if (boat.render === render) delete boat.render;
        });
      }
      supDelete(id);
    }, false);
  }

  protected handleMoves(s: { t: number, m: number[], s: number[] }) {
    const boat = this._boats[-s.t] || this._boats[s.t];
    if (!boat) return;
    boat.moves = s.m;
    boat.shots = s.s || [];
    this.worker.addJob(() => {
      boat.render?.updateMoves();
    });
  }

  protected resetBoats(): void {
    super.resetBoats();
    for (const boat of this.boats) boat.render?.updateMoves();
  }

  protected async handleTurn(turn: Turn) {
    this.flagData = turn.flags;
    this.setHeaderFlags(turn.flags);
    super.handleTurn(turn);
  }

  protected setHeaderFlags(flags: Turn['flags']) {
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

  protected playTurn() {
    for (let step = 0; step < 8; step++) {
      this.worker.addJob(() => {
        return this._playTurn(step);
      });
    }
    this.worker.addJob(async () => {
      delete this.turn;
      this.step = -1;
      await new Promise(resolve => setTimeout(resolve, 3000));
      this.ws.send(OutCmd.Sync);
    });
  }

  private _playTurn(step: number) {
    if (!this.turn) return;
    setTimeout(() => this.handleUpdate(this.turn?.cSteps[step] || []), 12500 / this.speed);
    if (step === 4) this.resetBoats();
    const turnPart = this.turn.steps[step] || [];
    if (!turnPart.length) return new Promise<void>(resolve => {
      setTimeout(resolve, 12500 / this.speed);
    });

    const promises: Promise<any>[] = [];
    const updates = new Map<number, BoatStatus>();
    for (const u of turnPart) updates.set(u.id, u);

    for (const boat of this.boats) {
      if (!boat.render) continue;
      const u = updates.get(boat.id);
      boat.crunchDir = -1;
      boat.imageOpacity = 1;
      if (!u) continue;
      if (u.c) boat.addDamage(u.c - 1, u.cd || 0);
      if (u.tm === undefined || u.tf === undefined) continue;
      if (boat.rotateTransition === 0) boat.rotateTransition = 1;
      boat.setPos(u.x, u.y)
        .setTransition(u.tf, u.tm)
        .rotateByMove(u.tm);

      const p = boat.render.update(true);
      if (p) promises.push(p);
    }
    return Promise.all(promises);
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
        hovered = boat.team || 0;
        break;
      }
    }
    for (const boat of this.boats) boat.render?.showInfluence(boat.team === hovered);
  }

  findClick(ray: Ray) {
    if (!this.camera) return;
    const cam = this.camera;
    this.boats.sort((a, b) => {
      if (!a.render) return -1;
      if (!b.render) return 1;
      return a.render.obj.position.distanceToSquared(cam.position) - b.render.obj.position.distanceToSquared(cam.position);
    });
    const box = new Box3();

    for (const boat of this.boats) {
      if (!boat.render?.hitbox) continue;
      box.setFromObject(boat.render.hitbox);
      if (ray.intersectsBox(box)) {
        this.ws.dispatchMessage({ cmd: Internal.BoatClicked, data: boat });
        return;
      }
    }
  }

  private async renderSync() {
    if (this.blockRender) return;

    for (const boat of this.boats) {
      if (!boat.render) continue;
      if (boat.render.update(false)) continue;
      boat.render.dispose();
      delete boat.render;
    }
    return Promise.all(this.checkNewShips()).then(() => {
      this.controls?.dispatchEvent({ type: 'change', target: null });
    });
  }

  protected checkNewShips() {
    const boatUpdates: Promise<void>[] = [];
    for (const boat of this.boats) {
      if (boat.render) continue;
      const prom = this.ships[boat.type] || this.ships[24];
      if (!prom) continue;
      boatUpdates.push(prom.then(gltf => {
        let newBoat = this._boats[boat.id];
        if (newBoat.render && boat.render !== newBoat.render) newBoat = this._boats[-boat.id];
        if (!this.camera || !newBoat || newBoat.render) return;
        boat.render = new BoatRender(boat, gltf).scaleHeader(this.camera);
        this.scene?.add(boat.render.obj);
      }));
    }
    return boatUpdates;
  }

}
