import { Injectable, OnDestroy } from '@angular/core';
import {
  Scene,
  Box3,
  Ray, MeshStandardMaterial, Mesh, DoubleSide, Camera, Material,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { Tween } from '@tweenjs/tween.js';
import { WsService } from '../../ws/ws.service';
import { OutCmd, Internal } from '../../ws/ws-messages';
import { Sounds, SoundService } from '../../sound.service';
import { BoatsComponent } from '../quacken/boats/boats.component';
import { Cannonball } from './clutter/cannonball';
import { BoatRender } from './boat-render';
import { JobQueue } from './job-queue';
import { ObstacleConfig } from './threed-render/threed-render.component';
import { Team, BoatSync, Turn, BoatStatus, Clutter } from '../quacken/boats/types';

export const flagMats: Record<Team, Material> = {
  0: new MeshStandardMaterial({ color: 'green', side: DoubleSide }),
  1: new MeshStandardMaterial({ color: 'darkred', side: DoubleSide }),
  2: new MeshStandardMaterial({ color: 'gold', side: DoubleSide }),
  3: new MeshStandardMaterial({ color: 'magenta', side: DoubleSide }),
  99: new MeshStandardMaterial({ color: '#CDCA97', side: DoubleSide }),
  100: new MeshStandardMaterial({ color: '#333', side: DoubleSide }),
};

export const checkSZ = (pos: { x: number, y: number }): boolean => {
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
  private flagData: { x: number, y: number, t: Team, p: number, cs: number[] }[] = [];
  private worker = new JobQueue();
  protected checkSZ = checkSZ;

  constructor(ws: WsService, protected sound: SoundService) {
    super(ws);
    super.ngOnInit();
    BoatRender.updateCam = (br) => this.updateCam(br);

    // this.subs.add(this.ws.subscribe(Internal.Boats, (m: Lobby) => {
    //   this.flagData = m.flags || [];
    // }));
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static dispose(o: any): void {
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

  ngOnDestroy(): void {
    super.ngOnDestroy();

    this.worker.clearJobs();
    for (const p of Object.values(this.ships)) void p.then(s => BoatService.dispose(s.scene));
  }

  setScene(s: Scene, objGetter: (c: ObstacleConfig) => Promise<GLTF>, cam: Camera): Promise<void> | undefined {
    this.scene = s;
    this.camera = cam;

    if (!Object.keys(this.ships).length) {
      for (const [id, config] of Object.entries(shipModels)) {
        this.ships[+id] = objGetter(config as any);
      }

      this.blockRender = false;
    }
    return this.renderSync();
  }

  setControls(con: OrbitControls): void {
    this.controls = con;
    con.addEventListener('change', () => {
      if (!this.camera) return;
      for (const boat of this.boats) {
        boat.render?.scaleHeader(this.camera);
      }
    });
  }

  protected setBoats(b: BoatSync[], reset = true): void {
    const supSet = super.setBoats.bind(this);
    if (reset) {
      this.worker.clearJobs();
    }

    void this.worker.addJob(async () => {
      const boats = this.boats;
      supSet(b, reset);
      if (reset) await this.renderSync();
      else await Promise.all(this.checkNewShips());

      for (const boat of boats) {
        if (!(this._boats[-boat.id]?.render === boat.render || this._boats[boat.id]?.render === boat.render)) {
          void boat.render?.dispose();
          delete boat.render;
          continue;
        }
        boat.checkSZ = this.checkSZ;
      }
    });
  }

  protected deleteBoat(id: number): void {
    const supDelete = super.deleteBoat.bind(this);
    void this.worker.addJob(() => {
      const boat = this._boats[id];
      if (boat?.render) {
        const render = boat.render;
        void render.dispose().then(() => {
          if (boat.render === render) delete boat.render;
        });
      }
      supDelete(id);
    }, false);
  }

  protected handleMoves(s: { t: number, m: number[], s: number[] }): void {
    if (Array.isArray(s)) {
      for (const part of s) this.handleMoves(part);
      return;
    }
    const boat = this._boats[-s.t] || this._boats[s.t];
    if (!boat) return;
    boat.moves = s.m;
    boat.shots = s.s || [];
    void this.worker.addJob(() => {
      boat.render?.updateMoves();
    });
  }

  protected resetBoats(): void {
    super.resetBoats();
    for (const boat of this.boats) boat.render?.updateMoves();
  }

  protected handleTurn(turn: Turn): void {
    if (turn.flags) {
      this.flagData = turn.flags;
      this.setHeaderFlags(turn.flags);
    }
    super.handleTurn(turn);
  }

  protected setHeaderFlags(_flags: Turn['flags']): void {
    if (!this.flags) return;

    for (const boat of this.boats) if (boat.render) boat.render.flags = [];
    for (let i = 0; i < this.flags.length; i++) {
      const f = this.flagData[i];
      if (!f) continue;
      const flag = this.flags[i];
      if (flag) flag.material = flagMats[f.t] ?? flagMats[99];
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

  protected playTurn(): void {
    this.worker.clearJobs();
    for (let step = 0; step < 8; step++) {
      void this.worker.addJob(() => this._playTurn(step));
      if (step % 2 === 1) {
        void this.worker.addJob(() => {
          return this.handleUpdate(this.turn?.cSteps[step]?.filter(c => !c.id) || [], step);
        });
      }
    }
    void this.worker.addJob(async () => {
      delete this.turn;
      this.step = -1;
      await new Promise<void>(resolve => {
        const start = new Date().valueOf();
        new Tween({}, BoatRender.tweens).to({}, 30000 / this.speed).onComplete(() => resolve()).start(start);
      });
    });
    void this.worker.addJob(() => {
      this.ws.send(OutCmd.Sync);
    });
  }

  private _playTurn(step: number) {
    if (!this.turn) return;
    if (step === 4) this.resetBoats();
    const promises: Promise<any>[] = [];
    if (step % 2 === 0) promises.push(this.handleUpdate(this.turn?.cSteps[step] || [], step));
    else promises.push(this.handleUpdate(this.turn?.cSteps[step]?.filter(c => c.id) || [], step));
    const turnPart = this.turn.steps[step] || [];

    const updates = new Map<number, BoatStatus>();
    for (const u of turnPart) updates.set(u.id, u);

    for (const boat of this.boats) {
      if (!boat.render) continue;
      const u = updates.get(boat.id);
      boat.crunchDir = -1;
      boat.imageOpacity = 1;
      if (!u) {
        const p = boat.render.update(true);
        if (p) promises.push(p);
        continue;
      };
      if (u.c) {
        boat.addDamage(u.c - 1, u.cd);
        if (u.cd === 100) void this.sound.play(Sounds.Sink, 10000 / this.speed);
        if (u.c < 5) void this.sound.play(Sounds.RockDamage, 3500 / this.speed);
      }
      // ignore spin if the boat sank as the animations will conflict
      if (u.s && boat.moveLock !== 101) {
        boat.face += boat.spinDeg * u.s;
        boat.rotateTransition = 4;
      }
      if (u.tm === undefined || u.tf === undefined) continue;
      if (boat.rotateTransition === 0) boat.rotateTransition = 1;
      boat.setPos(u.x, u.y)
        .setTransition(u.tf, u.tm)
        .rotateByMove(u.tm);

      const p = boat.render.update(true);
      if (p) promises.push(p);
    }

    this.sortBoats();
    return Promise.all(promises);
  }

  protected handleUpdate(updates: Clutter[], _: number): Promise<void> {
    if (!this.scene) return Promise.resolve();
    Cannonball.speed = this.speed;
    for (const u of updates) {
      if (u.t > 4) continue;
      new Cannonball(this.scene, u).start();
      if (u.dbl) new Cannonball(this.scene, u).start(2000 / this.speed);
    }
    return Promise.resolve();
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

  showInfluence(ray: Ray, team: number): void {
    if (!this.camera) return;
    const cam = this.camera;
    this.boats.sort((a, b) => {
      if (!a.render) return -1;
      if (!b.render) return 1;
      return a.render.obj.position.distanceToSquared(cam.position) -
        b.render.obj.position.distanceToSquared(cam.position);
    });
    const box = new Box3();

    if (team >= 0) {
      for (const boat of this.boats) boat.render?.showInfluence(boat.render.team === team);
      return;
    }

    let hovered = -1;
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

  findClick(ray: Ray): void {
    if (!this.camera) return;
    const cam = this.camera;
    this.boats.sort((a, b) => {
      if (!a.render) return -1;
      if (!b.render) return 1;
      return a.render.obj.position.distanceToSquared(cam.position) -
        b.render.obj.position.distanceToSquared(cam.position);
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

  private renderSync() {
    if (this.blockRender) return;

    for (const boat of this.boats) {
      if (!boat.render) continue;
      if (boat.render.update(false)) continue;
      void boat.render.dispose();
      delete boat.render;
    }
    return Promise.all(this.checkNewShips()).then(() => {
      this.controls?.dispatchEvent({ type: 'change', target: null });
    });
  }

  protected checkNewShips(): Promise<void>[] {
    const boatUpdates: Promise<void>[] = [];
    for (const boat of this.boats) {
      if (boat.render) continue;
      const prom = this.ships[boat.type] || this.ships[24];
      if (!prom) continue;
      boatUpdates.push(prom.then(gltf => {
        let newBoat = this._boats[boat.id];
        if (newBoat?.render && boat.render !== newBoat.render) newBoat = this._boats[-boat.id];
        if (!this.camera || !newBoat || newBoat.render) return;
        boat.render = new BoatRender(boat, gltf).scaleHeader(this.camera);
        this.scene?.add(boat.render.obj);
      }));
    }
    return boatUpdates;
  }
}
