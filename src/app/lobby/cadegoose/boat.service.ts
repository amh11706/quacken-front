import { Injectable } from '@angular/core';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import { BoatsComponent, BoatSync } from '../quacken/boats/boats.component';
import { ObstacleConfig } from './cadegoose.component';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { WsService } from 'src/app/ws.service';
import { OutCmd } from 'src/app/ws-messages';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Boat } from '../quacken/boats/boat';

const moveEase: any[] = [,
  TWEEN.Easing.Linear.None,
  TWEEN.Easing.Quadratic.In,
  TWEEN.Easing.Quadratic.Out,
  TWEEN.Easing.Linear.None,
];

const rotateTransition = [,
  ,
  { duration: 3000, easing: TWEEN.Easing.Linear.None, delay: 500 },
  { duration: 1000, easing: TWEEN.Easing.Quadratic.InOut },
  { duration: 200, easing: TWEEN.Easing.Quadratic.InOut },
];

const shipModels: any = {
  22: { path: 'WB', offsetX: 0, offsetZ: 0, offsetY: 0.17, scalar: 0.02, rotate: -Math.PI / 2 },
  24: { path: 'xebec', offsetX: -0.05, offsetZ: 0, scalar: 0.015, rotate: Math.PI },
  26: { path: 'WF', ext: 'glb', offsetX: 0, offsetZ: 0, offsetY: 0.18, scalar: 0.22 },
};

interface BoatRender {
  id: number;
  obj: THREE.Object3D;
  header: THREE.Group;
  title: THREE.Sprite;
  type: number;
  pos: { x: number, y: number };
  rotateDeg: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class BoatService extends BoatsComponent {
  private boatRenders: BoatRender[] = [];
  private scene?: THREE.Scene;
  private getModel?: (c: ObstacleConfig) => Promise<GLTF>;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private ships: Record<number, GLTF> = {};
  private rendering = true;
  private tweens = new TWEEN.Group();
  private myLastPos = { x: 0, z: 0 };

  constructor(ws: WsService) {
    super(ws);
    super.ngOnInit();
  }

  async setScene(s: THREE.Scene, objGetter: (c: ObstacleConfig) => Promise<GLTF>, cam: THREE.PerspectiveCamera) {
    this.scene = s;
    this.getModel = objGetter;
    this.camera = cam;

    if (!Object.keys(this.ships).length) {
      const models = Object.entries(shipModels);
      const promises = [];
      for (const [, config] of models) {
        promises.push(objGetter(config as any));
      }
      const ships = await Promise.all(promises);
      for (let i = 0; i < ships.length; i++) {
        this.ships[+models[i][0]] = ships[i];
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
    this.updateRender();
  }

  protected deleteBoat(id: number) {
    super.deleteBoat(id);
    this.updateRender();
  }


  protected playTurn = () => {
    const clutterPart = this.turn?.cSteps[this.step] || [];
    setTimeout(() => this.handleUpdate(clutterPart), 10000 / this.speed);
    const turnPart = this.turn?.steps[this.step] || [];
    for (const u of turnPart) {
      const boat = this._boats[u.id];
      if (!boat || u.tm === undefined || u.tf === undefined) continue;

      if (u.c && u.c > 0) boat.addDamage(u.c - 1, u.cd || 0);
      boat.rotateTransition = 1;
      boat.setPos(u.x, u.y)
        .setTransition(u.tf, u.tm);

      boat.rotateByMove(u.tm);
    }

    if (this.step === 4) this.resetBoats();

    this.step++;
    const delay = (this.turn?.steps[this.step] || this.turn?.cSteps[this.step] ? 750 : 250) * 20 / this.speed;
    if (this.step < 8) this.animateTimeout = window.setTimeout(this.playTurn, delay);
    else this.animateTimeout = window.setTimeout(() => this.ws.send(OutCmd.Sync), 2500);
    if (this.turn?.steps[this.step - 1]?.length) this.updateRender();
  }

  private makeName(name: string, size = 36): THREE.Sprite {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return new THREE.Sprite();
    const font = `${size}px bold sans-serif`;
    ctx.font = font;

    const width = ctx.measureText(name).width;
    const height = size;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.translate(width / 2, height / 2);
    ctx.fillStyle = 'blue';
    ctx.fillText(name, 0, 0);

    const canvas = ctx.canvas;
    const texture = new THREE.CanvasTexture(canvas);
    // because our canvas is likely not a power of 2
    // in both dimensions set the filtering appropriately.
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const labelMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      sizeAttenuation: false,
    });

    const sprite = new THREE.Sprite(labelMaterial);
    sprite.renderOrder = 3;
    sprite.scale.x = 0.035 / height * width;
    sprite.scale.y = 0.035;
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

  private updateRender() {
    console.log(this.boats, this.boatRenders)
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

      if (boat.name !== br.name) {
        br.header.remove(br.title);
        br.title.material.dispose();
        br.title.geometry.dispose();

        const name = this.makeName(boat.name);
        br.title = name;
        br.header.add(name);
        br.name = boat.name;
      }
      newRenders.push(br);
      boat.rendered = true;
    }
    this.boatRenders = newRenders;

    this.checkNewShips();
    this.rendering = false;
  }

  private delBoatRender(br: BoatRender) {
    this.scene?.remove(br.obj);
    for (const c of br.header.children) {
      if (!(c instanceof THREE.Sprite)) continue;
      c.geometry.dispose();
      c.material.dispose();
    }
    console.log('removed boat', br.id);
  }

  private checkNewShips() {
    for (const boat of this.boats) {
      if (!boat.rendered) {
        const gltf = this.ships[boat.type] || this.ships[24];
        const boatObj = new THREE.Object3D();
        boatObj.add(gltf.scene.clone());
        boatObj.position.x = boat.pos.x + 0.5;
        boatObj.position.z = boat.pos.y + 0.5;
        boatObj.rotation.y = -boat.face * Math.PI / 180;

        const header = new THREE.Group();
        let scale = (this.camera?.position.distanceTo(boatObj.position) || 16) / 36;
        if (scale > 0.5) {
          header.scale.setScalar(0.5 / scale);
          scale = 0.5;
        } else header.scale.setScalar(1);
        header.position.y = 0.6 + scale;
        boatObj.add(header);
        const name = this.makeName(boat.name);
        header.add(name);

        this.scene?.add(boatObj);
        this.boatRenders.push({
          id: boat.id || 0, obj: boatObj, header, title: name, type: boat.type,
          pos: boat.pos, rotateDeg: boat.face, name: boat.name
        });
        console.log('added boat', boat.id);
      }
      boat.rendered = false;
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
        const rotation = rotateTransition[boat.rotateTransition];
        if (!rotation) return;
        this.tweens.add(new TWEEN.Tween(br.obj.rotation as any)
          .to({ y: -boat.face * Math.PI / 180 }, rotation.duration)
          .easing(rotation.easing)
          .delay(rotation.delay || 0)
          .start(startTime));
      }
    } else br.obj.rotation.y = -boat.face * Math.PI / 180;

    if (boat.imageOpacity === 0) {
      new TWEEN.Tween(br.obj.position as any)
        .to({ y: -5 }, 5000)
        .delay(500)
        .easing(TWEEN.Easing.Quadratic.In)
        .start(startTime);
      new TWEEN.Tween(br.obj.scale as any)
        .to({ x: 0, y: 0, z: 0 }, 5000)
        .start(startTime);
    }
    br.rotateDeg = boat.face;
  }

}
