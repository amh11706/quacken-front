import { Mesh, MeshPhongMaterial, Scene, SphereGeometry, Vector3 } from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { Clutter } from '../../quacken/boats/boats.component';

const decodeX = [0, 1, 0, -1];
const decodeY = [-1, 0, 1, 0];

export class Cannonball {
    static speed = 15;
    private static template: Mesh;
    private cb: Mesh;
    private group = new TWEEN.Group();

    constructor(scene: Scene, private obj: Clutter) {
      if (!Cannonball.template) {
        const geo = new SphereGeometry(0.025);
        const mat = new MeshPhongMaterial({ color: 'silver' });
        Cannonball.template = new Mesh(geo, mat);
      }

      this.cb = Cannonball.template.clone();
      this.cb.position.copy(new Vector3(obj.x + 0.5, 0.1, obj.y + 0.5));
      scene.add(this.cb);
    }

    start(delay = 0) {
      const obj = this.obj;
      if (typeof obj.dir !== 'number' || !obj.dis) return this.remove();
      const hit = obj.dis < 4;
      if (!hit) obj.dis = 3;
      const p = this.cb.position;
      const time = new Date().valueOf() + delay;
      this.group.add(new TWEEN.Tween(p)
        .to({ x: p.x + decodeX[obj.dir] * obj.dis, z: p.z + decodeY[obj.dir] * obj.dis }, 3000 / Cannonball.speed * obj.dis)
        .start(time)
        .onComplete(() => {
          this.remove();
        }),
      );
      this.group.add(new TWEEN.Tween(p)
        .to({ y: 0.2 }, 1500 / Cannonball.speed * 3)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start(time).chain(new TWEEN.Tween(p)
          .to({ y: 0.1 }, 1500 / Cannonball.speed * 3)
          .easing(TWEEN.Easing.Quadratic.In),
        ),
      );
    }

    remove() {
      for (const t of this.group.getAll()) TWEEN.remove(t);
      this.group.removeAll();
      this.cb.parent?.remove(this.cb);
    }
}
