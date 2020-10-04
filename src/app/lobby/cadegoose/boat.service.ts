import { Injectable } from '@angular/core';
import {
  Scene,
  PerspectiveCamera,
  Box3,
  Ray, MeshStandardMaterial, Mesh, DoubleSide
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

@Injectable({
  providedIn: 'root'
})
export class BoatService extends BoatsComponent {
  private boatRenders: BoatRender[] = [];
  private scene?: Scene;
  private camera?: PerspectiveCamera;
  private controls?: OrbitControls;
  private ships: Record<number, Promise<GLTF>> = {};
  private blockRender = true;
  flags: Mesh[] = [];

  constructor(ws: WsService) {
    super(ws);
    super.ngOnInit();
    BoatRender.updateCam = (br) => this.updateCam(br);
  }

  async setScene(s: Scene, objGetter: (c: ObstacleConfig) => Promise<GLTF>, cam: PerspectiveCamera) {
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
      for (const br of this.boatRenders) {
        br.scaleHeader(this.camera);
      }
    });
  }

  protected setBoats(b: BoatSync[]) {
    super.setBoats(b);
    for (const boat of this.boats) boat.checkSZ = checkSZ;
    this.updateRender(!this.turn);
  }

  protected deleteBoat(id: number) {
    super.deleteBoat(id);
    this.updateRender(!this.turn);
  }

  protected handleMoves(s: { t: number, m: number[] }) {
    const boat = this._boats[s.t];
    if (!boat) return;
    boat.moves = s.m;
    const br = this.boatRenders.find(r => r.boat === boat);
    if (br) br.updateMoves();
  }

  protected resetBoats(): void {
    super.resetBoats();
    for (const br of this.boatRenders) br.updateMoves();
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
      if (!boat) continue;
      if (u.c) boat.addDamage(u.c - 1, u.cd || 0);

      if (u.tm === undefined || u.tf === undefined) continue;
      boat.rotateTransition = 1;
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

  private updateRender(doDelete = false) {
    if (this.blockRender) return;
    BoatRender.tweens.update(Infinity);
    const startTime = new Date().valueOf();
    for (const b of this.boats) b.rendered = false;

    const newRenders: BoatRender[] = [];
    for (const br of this.boatRenders) {
      br.boat = this._boats[br.boat.id || 0] || br.boat;
      if (!doDelete || br.update(startTime)) newRenders.push(br);
      else br.dispose();
    }
    this.boatRenders = newRenders;

    this.checkNewShips();
  }

  private checkNewShips() {
    for (const boat of this.boats) {
      if (!boat.rendered) {
        boat.rendered = true;
        const prom = this.ships[boat.type] || this.ships[24];
        prom?.then(gltf => {
          if (!this.camera) return;
          const br = new BoatRender(boat, gltf).scaleHeader(this.camera);
          this.scene?.add(br.obj);
          this.boatRenders.push(br);
        });
      }
    }
  }

}
