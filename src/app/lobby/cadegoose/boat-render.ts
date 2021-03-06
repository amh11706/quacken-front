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

const flagColor = { 0: 'lime', 1: 'red', 100: '#666' };


const red = new THREE.LineBasicMaterial({ color: 'red', transparent: true, opacity: 0 });
const green = new THREE.LineBasicMaterial({ color: 'lime', transparent: true, opacity: 0 });

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
    hitbox?: THREE.LineSegments<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
    flags: { p: number, t: number }[] = [];

    private influence: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
    private header = new THREE.Group();
    private title: THREE.Sprite;
    private headerTex: THREE.CanvasTexture;
    private headerCtx: CanvasRenderingContext2D;
    private type: number;
    private pos: { x: number, y: number };
    private rotateDeg: number;
    private name: string;
    private moves: number[];
    private influenceTween: any;
    private tweenTarget = 0;
    private nameTimeout = 0;

    constructor(public boat: Boat, gltf: GLTF) {
        if (!BoatRender.circle) {
            const circle = new THREE.EllipseCurve(0, 0, 0.5, 0.5, 0, 2 * Math.PI, false, 0);
            const circleGeo = new THREE.BufferGeometry().setFromPoints(circle.getPoints(50));
            circleGeo.rotateX(-Math.PI / 2);
            circleGeo.translate(0, 0.02, 0);
            BoatRender.circle = new THREE.Line(circleGeo);
            BoatRender.circle.visible = false;
        }

        this.obj.add(gltf.scene.clone());
        this.obj.position.x = boat.pos.x + 0.5;
        this.obj.position.z = boat.pos.y + 0.5;
        this.obj.rotation.y = -boat.face * Math.PI / 180;

        this.influence = BoatRender.circle.clone();
        this.influence.scale.setScalar(boat.influence);
        this.influence.material = (boat.team ? red : green).clone();
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
        this.influence.material.dispose();
        if (this.title) {
            this.title.geometry.dispose();
            this.title.material.dispose();
            this.title.material.map?.dispose();
        }
        console.log('removed boat', this.boat.id);
    }

    showInfluence(v = true): void {
        if (this.tweenTarget === +v) return;
        this.tweenTarget = +v;
        this.boat.renderName = v ? this.boat.title : this.boat.name;

        if (this.nameTimeout) clearTimeout(this.nameTimeout);
        this.nameTimeout = setTimeout(() => {
            if (this.name !== this.boat.renderName) this.rebuildHeader();

            if (this.influenceTween) {
                this.influenceTween.end();
                TWEEN.remove(this.influenceTween);
            }
            if (this.influence.material.opacity === this.tweenTarget) {
                this.influence.visible = v;
                return;
            }
            if (v) this.influence.visible = true;

            this.influenceTween = new TWEEN.Tween(this.influence.material as any)
                .to({ opacity: this.tweenTarget }, 200)
                .start(new Date().valueOf())
                .onComplete(() => this.influence.visible = v);
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

    update(startTime: number) {
        if (this.boat.type !== this.type) {
            return;
        }
        const promises: Promise<any>[] = [];

        if (this.boat.pos.x !== this.pos.x || this.boat.pos.y !== this.pos.y || this.boat.crunchDir !== -1) {
            promises.push(this.updateBoatPos(startTime));
        }

        if (this.boat.face !== this.rotateDeg || this.boat.imageOpacity === 0) {
            promises.push(this.updateBoatRot(startTime));
        }

        if (this.team !== this.boat.team) {
            this.influence.material.dispose();
            this.influence.material = (this.boat.team ? red : green).clone();
            this.rebuildHeader();
        }

        if (this.name !== this.boat.name) {
            this.rebuildHeader();
        }
        this.boat.rendered = true;
        return Promise.all(promises);
    }

    rebuildHeader() {
        if (this.title) this.header.remove(this.title);

        this.makeHeader();
        this.name = this.boat.renderName;
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
        ctx.restore();
        const font = `${size}px bold sans-serif`;
        ctx.font = font;

        const width = Math.max(ctx.measureText(this.boat.renderName).width, 160);
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
        ctx.fillText(this.boat.renderName, 0, 0);

        for (let i = 0; i < this.boat.moves.length; i++) {
            const color = moveColor[this.boat.moves[i]];
            if (!color) continue;
            ctx.fillStyle = color;
            ctx.fillRect(-60 + 30 * i, 24, 30, 20);
        }
        ctx.lineWidth = 2;
        ctx.strokeRect(- 60, 24, 120, 20);

        if (this.flags.length) {
            ctx.font = font;
            ctx.textAlign = 'left';
            const flagWidth = ctx.measureText(this.flags.reduce((p, c) => p + c.p, '')).width;
            let shownFlags = '';
            for (const f of this.flags) {
                ctx.fillStyle = flagColor[f.t as keyof typeof flagColor];
                const offset = ctx.measureText(shownFlags).width;
                ctx.fillText(String(f.p), -flagWidth / 2 + offset, 64);
                shownFlags += f.p;
            }
        }

        this.headerTex.needsUpdate = true;

        this.title.scale.x = 0.08 / height * width;
        this.header.add(this.title);
        return this;
    }

    private updateBoatPos(startTime: number) {
        let t: any;
        const decodeX = [0, 0.4, 0, -0.4];
        const decodeY = [-0.4, 0, 0.4, 0];

        const p = Promise.all([
            new Promise<void>(resolve => {
                const offsetX = decodeX[this.boat.crunchDir];
                if (offsetX) {
                    BoatRender.tweens.add(new TWEEN.Tween(this.obj.position as any)
                        .to({ x: this.pos.x + offsetX + 0.5 }, 3000 / BoatRender.speed)
                        .delay(4000 / BoatRender.speed)
                        .repeatDelay(500 / BoatRender.speed)
                        .repeat(1).yoyo(true)
                        .start(startTime)
                        .onComplete(resolve));

                } else if (this.boat.moveTransition[0]) {
                    t = new TWEEN.Tween(this.obj.position as any)
                        .easing(moveEase[this.boat.moveTransition[0]])
                        .to({ x: this.boat.pos.x + 0.5 }, 10000 / BoatRender.speed)
                        .start(startTime)
                        .onComplete(resolve);
                    BoatRender.tweens.add(t);
                } else {
                    this.obj.position.x = this.boat.pos.x + 0.5;
                    resolve();
                }
            }),
            new Promise<void>(resolve => {
                const offsetY = decodeY[this.boat.crunchDir];
                if (offsetY) {
                    BoatRender.tweens.add(new TWEEN.Tween(this.obj.position as any)
                        .to({ z: this.pos.y + offsetY + 0.5 }, 3000 / BoatRender.speed)
                        .delay(4000 / BoatRender.speed)
                        .repeatDelay(500 / BoatRender.speed)
                        .repeat(1).yoyo(true)
                        .start(startTime)
                        .onComplete(resolve));

                } else if (this.boat.moveTransition[1]) {
                    t = new TWEEN.Tween(this.obj.position as any)
                        .easing(moveEase[this.boat.moveTransition[1]])
                        .to({ z: this.boat.pos.y + 0.5 }, 10000 / BoatRender.speed)
                        .start(startTime)
                        .onComplete(resolve);
                    BoatRender.tweens.add(t);
                } else {
                    this.obj.position.z = this.boat.pos.y + 0.5;
                    resolve();
                }
            }),
        ]);

        if (this.boat.isMe && t) {
            BoatRender.myLastPos = { ...this.obj.position };
            t.onUpdate(() => BoatRender.updateCam(this));
        }

        this.boat.crunchDir = -1;
        this.pos = this.boat.pos;
        return p;
    }

    private updateBoatRot(startTime: number) {
        const promises: Promise<void>[] = [];

        if (this.boat.rotateTransition) {
            promises.push(new Promise(resolve => {
                if (this.boat.rotateTransition === 1) {
                    BoatRender.tweens.add(new TWEEN.Tween(this.obj.rotation as any)
                        .to({ y: -this.boat.face * Math.PI / 180 }, 9000 / BoatRender.speed)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start(startTime + 1000 / BoatRender.speed)
                        .onComplete(resolve));
                } else {
                    BoatRender.tweens.add(new TWEEN.Tween(this.obj.rotation as any)
                        .to({ y: -this.boat.face * Math.PI / 180 }, 30000 / BoatRender.speed)
                        .easing(TWEEN.Easing.Quadratic.In)
                        .delay(500)
                        .start(startTime)
                        .onComplete(resolve));
                }
            }));
        } else this.obj.rotation.y = -this.boat.face * Math.PI / 180;

        if (this.boat.rotateTransition > 1) {
            promises.push(new Promise(resolve => {
                new TWEEN.Tween(this.obj.position as any)
                    .to({ y: -5 }, 20000 / BoatRender.speed)
                    .delay(2000)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .start(startTime)
                    .onComplete(resolve);
                new TWEEN.Tween(this.obj.scale as any)
                    .to({ x: 0, y: 0, z: 0 }, 20000 / BoatRender.speed)
                    .start(startTime);
            }));

            this.boat.imageOpacity = 1;
        }
        this.rotateDeg = this.boat.face;
        return Promise.all(promises);
    }
}
