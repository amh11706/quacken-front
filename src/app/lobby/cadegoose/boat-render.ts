import TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Boat } from '../quacken/boats/boat';

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

const red = new THREE.LineBasicMaterial({ color: 'red', linewidth: 1 });
const green = new THREE.LineBasicMaterial({ color: 'lime', linewidth: 1 });

const moveEase: any[] = [,
    TWEEN.Easing.Linear.None,
    TWEEN.Easing.Quadratic.In,
    TWEEN.Easing.Quadratic.Out,
    TWEEN.Easing.Linear.None,
];

export class BoatRender {
    private static circle?: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
    static tweens = new TWEEN.Group();
    static speed = 10;
    static updateCam: (br: BoatRender) => void;
    static myLastPos = { x: 0, z: 0 };

    obj = new THREE.Group();
    team: number;
    influence: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
    hitbox?: THREE.LineSegments<THREE.BufferGeometry, THREE.MeshBasicMaterial>;

    private header = new THREE.Group();
    private title?: THREE.Sprite;
    private type: number;
    private pos: { x: number, y: number };
    private rotateDeg: number;
    private name: string;
    private moves: number[];

    constructor(public boat: Boat, gltf: GLTF) {
        if (!BoatRender.circle) {
            const circle = new THREE.EllipseCurve(0, 0, 0.5, 0.5, 0, 2 * Math.PI, false, 0);
            const circleGeo = new THREE.BufferGeometry().setFromPoints(circle.getPoints(50));
            circleGeo.rotateX(-Math.PI / 2);
            circleGeo.translate(0, 0.02, 0);
            BoatRender.circle = new THREE.Line(circleGeo, green);
            BoatRender.circle.visible = false;
        }

        this.obj.add(gltf.scene.clone());
        this.obj.position.x = boat.pos.x + 0.5;
        this.obj.position.z = boat.pos.y + 0.5;
        this.obj.rotation.y = -boat.face * Math.PI / 180;

        this.influence = BoatRender.circle.clone();
        this.influence.scale.setScalar(boat.influence);
        this.influence.material = boat.team ? red : green;
        this.obj.add(this.influence);

        this.obj.add(this.header);
        this.makeHeader();

        this.type = boat.type;
        this.pos = boat.pos;
        this.rotateDeg = boat.face;
        this.name = boat.name;
        this.team = boat.team || 0;
        this.moves = [...boat.moves];
        this.hitbox = this.obj.getObjectByName('hitbox') as any;

        console.log('added boat', boat.id);
    }

    dispose() {
        this.obj.parent?.remove(this.obj);
        for (const c of this.header.children) {
            if (!(c instanceof THREE.Sprite)) continue;
            c.geometry.dispose();
            c.material.dispose();
        }
        console.log('removed boat', this.boat.id);
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

    update(startTime: number): boolean {
        if (this.boat.type !== this.type) {
            return false;
        }

        if (this.boat.pos.x !== this.pos.x || this.boat.pos.y !== this.pos.y || this.boat.crunchDir !== -1) {
            this.updateBoatPos(startTime);
        }

        if (this.boat.face !== this.rotateDeg || this.boat.imageOpacity === 0) {
            this.updateBoatRot(startTime);
        }

        if (this.name !== this.boat.name || this.team !== this.boat.team) {
            this.rebuildHeader();
        }
        this.influence.material = this.boat.team ? red : green;
        this.boat.rendered = true;
        return true;
    }

    private rebuildHeader() {
        if (this.title) {
            this.header.remove(this.title);
            this.title.material.dispose();
            this.title.geometry.dispose();
        }

        this.makeHeader();
        this.name = this.boat.name;
        this.team = this.boat.team || 0;
        this.moves = [...this.boat.moves];
    }

    scaleHeader(cam: THREE.Camera): BoatRender {
        let scale = (cam.position.distanceTo(this.obj.position) || 16) / 36;
        if (scale > 0.5) {
            this.header.scale.setScalar(0.5 / scale);
            scale = 0.5;
        } else this.header.scale.setScalar(1);
        this.header.position.y = 0.6 + scale;
        return this;
    }

    private makeHeader(size = 36): BoatRender {
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx) return this;
        const font = `${size}px bold sans-serif`;
        ctx.font = font;

        const width = ctx.measureText(this.boat.name).width;
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
        ctx.fillStyle = headerColor(this.boat);
        ctx.fillText(this.boat.name, 0, 0);

        for (let i = 0; i < this.boat.moves.length; i++) {
            const color = moveColor[this.boat.moves[i]];
            if (!color) continue;
            ctx.fillStyle = color;
            ctx.fillRect(-60 + 30 * i, 24, 30, 20);
        }
        ctx.lineWidth = 2;
        ctx.strokeRect(- 60, 24, 120, 20);

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

        this.title = new THREE.Sprite(labelMaterial);
        this.title.renderOrder = 3;
        this.title.scale.x = 0.03 / height * width;
        this.title.scale.y = 0.06;
        this.header.add(this.title);
        return this;
    }

    private updateBoatPos(startTime: number) {
        let t: any;
        const decodeX = [0, 0.4, 0, -0.4];
        const decodeY = [-0.4, 0, 0.4, 0];

        const offsetX = decodeX[this.boat.crunchDir];
        if (offsetX) {
            BoatRender.tweens.add(new TWEEN.Tween(this.obj.position as any)
                .to({ x: this.pos.x + offsetX + 0.5 }, 3000 / BoatRender.speed)
                .delay(4000 / BoatRender.speed)
                .repeatDelay(500 / BoatRender.speed)
                .repeat(1).yoyo(true)
                .start(startTime));

        } else if (this.boat.moveTransition[0]) {
            t = new TWEEN.Tween(this.obj.position as any)
                .easing(moveEase[this.boat.moveTransition[0]])
                .to({ x: this.boat.pos.x + 0.5 }, 10000 / BoatRender.speed)
                .start(startTime);
            BoatRender.tweens.add(t);
        } else this.obj.position.x = this.boat.pos.x + 0.5;

        const offsetY = decodeY[this.boat.crunchDir];
        if (offsetY) {
            BoatRender.tweens.add(new TWEEN.Tween(this.obj.position as any)
                .to({ z: this.pos.y + offsetY + 0.5 }, 3000 / BoatRender.speed)
                .delay(4000 / BoatRender.speed)
                .repeatDelay(500 / BoatRender.speed)
                .repeat(1).yoyo(true)
                .start(startTime));

        } else if (this.boat.moveTransition[1]) {
            t = new TWEEN.Tween(this.obj.position as any)
                .easing(moveEase[this.boat.moveTransition[1]])
                .to({ z: this.boat.pos.y + 0.5 }, 10000 / BoatRender.speed)
                .start(startTime);
            BoatRender.tweens.add(t);
        } else this.obj.position.z = this.boat.pos.y + 0.5;

        if (this.boat.isMe && t) {
            BoatRender.myLastPos = { ...this.obj.position };
            t.onUpdate(() => BoatRender.updateCam(this));
        }

        this.boat.crunchDir = -1;
        this.pos = this.boat.pos;
    }

    private updateBoatRot(startTime: number) {
        if (this.boat.rotateTransition) {
            if (this.boat.rotateTransition === 1) {
                BoatRender.tweens.add(new TWEEN.Tween(this.obj.rotation as any)
                    .to({ y: -this.boat.face * Math.PI / 180 }, 9000 / BoatRender.speed)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start(startTime + 1000 / BoatRender.speed));
            } else {
                BoatRender.tweens.add(new TWEEN.Tween(this.obj.rotation as any)
                    .to({ y: -this.boat.face * Math.PI / 180 }, 3000)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .delay(500)
                    .start(startTime));
            }
        } else this.obj.rotation.y = -this.boat.face * Math.PI / 180;

        if (this.boat.imageOpacity === 0) {
            new TWEEN.Tween(this.obj.position as any)
                .to({ y: -5 }, 5000)
                .delay(2000)
                .easing(TWEEN.Easing.Quadratic.In)
                .start(startTime);
            new TWEEN.Tween(this.obj.scale as any)
                .to({ x: 0, y: 0, z: 0 }, 5000)
                .start(startTime);

            this.boat.imageOpacity = 1;
        }
        this.rotateDeg = this.boat.face;
    }

}
