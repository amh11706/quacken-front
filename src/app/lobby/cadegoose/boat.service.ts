import { Injectable } from '@angular/core';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import { BoatsComponent, BoatSync } from '../quacken/boats/boats.component';
import { ObstacleConfig } from './cadegoose.component';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { WsService } from 'src/app/ws.service';

const moveEase: any[] = [,
  TWEEN.Easing.Linear,
  TWEEN.Easing.Quadratic.In,
  TWEEN.Easing.Quadratic.Out,
  TWEEN.Easing.Linear,
];

const shipModels: any = {
  22: { path: 'WB', offsetX: 0, offsetZ: 0, offsetY: 0.17, scalar: 0.02, rotate: Math.PI / 2 },
  24: { path: 'xebec', offsetX: -0.05, offsetZ: 0, scalar: 0.015, rotate: Math.PI },
  26: { path: 'WF', ext: 'glb', offsetX: 0, offsetZ: 0, offsetY: 0.18, scalar: 0.22 },
};

interface BoatRender {
  id: number;
  obj: THREE.Object3D;
  moveBar: THREE.Object3D;
  pos: { x: number, y: number };
  rotateDeg: number;
}

@Injectable({
  providedIn: 'root'
})
export class BoatService extends BoatsComponent {
  private boatRenders: BoatRender[] = [];
  private scene?: THREE.Scene;
  private getModel?: (c: ObstacleConfig) => Promise<GLTF>;
  private ships: Record<number, GLTF> = {};

  constructor(ws: WsService) {
    super(ws);
    super.ngOnInit();
  }

  setScene(s: THREE.Scene, objGetter: (c: ObstacleConfig) => Promise<GLTF>) {
    this.scene = s;
    this.getModel = objGetter;
    this.updateRender();
  }

  protected setBoats(b: BoatSync[]) {
    super.setBoats(b);
    this.updateRender();
  }

  protected playTurn() {
    super.playTurn();
    this.updateRender();
  }

  private async updateRender() {
    if (!this.scene || !this.getModel) return;

    const newRenders: BoatRender[] = [];
    for (const br of this.boatRenders) {
      const boat = this._boats[br.id];
      if (!boat) {
        this.scene.remove(br.obj);
        console.log('removed boat');
        continue;
      }

      if (boat.pos.x !== br.pos.x || boat.pos.y !== br.pos.y) {
        console.log('moving boat from', br.pos, 'to', boat.pos);
        if (boat.moveTransition[0]) {
          new TWEEN.Tween(br.obj.position as any)
            .to({ x: boat.pos.x + 0.5 }, 10000 / this.speed)
            .easing(moveEase[boat.moveTransition[0]])
            .start(0);
        } else br.obj.position.x = boat.pos.x + 0.5;

        if (boat.moveTransition[1]) {
          new TWEEN.Tween(br.obj.position as any)
            .to({ z: boat.pos.y + 0.5 }, 10000 / this.speed)
            .easing(moveEase[boat.moveTransition[1]])
            .start(0);
        } else br.obj.position.z = boat.pos.y + 0.5;

        br.pos = boat.pos;
      }

      if (boat.face !== br.rotateDeg) {
        new TWEEN.Tween(br.obj.rotation as any)
          .delay(1000 / this.speed)
          .to({ y: boat.face * Math.PI / 180 }, 9000 / this.speed)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .start(0);
        br.rotateDeg = boat.face;
      }
      newRenders.push(br);
      boat.rendered = true;
    }

    for (const boat of this.boats) {
      if (!boat.rendered) {
        const gltf = this.ships[boat.type] || await this.getModel(shipModels[boat.type] || shipModels[24]);
        this.ships[boat.type] = gltf;
        const boatObj = new THREE.Object3D();
        boatObj.add(gltf.scene.clone());
        boatObj.position.x = boat.pos.x + 0.5;
        boatObj.position.z = boat.pos.y + 0.5;
        boatObj.rotation.y += boat.face * Math.PI / 180;
        this.scene.add(boatObj);
        newRenders.push({ id: boat.id || 0, obj: boatObj, moveBar: new THREE.Object3D(), pos: boat.pos, rotateDeg: boat.face });
        console.log('added boat');
      }
      boat.rendered = false;
    }
    this.boatRenders = newRenders;
  }
}
