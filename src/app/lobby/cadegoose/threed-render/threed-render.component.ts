import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Input, NgZone } from '@angular/core';
import {
  Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, MeshBasicMaterial, Object3D, Vector3, Vector2,
  Raycaster, ACESFilmicToneMapping, Fog, AmbientLight, MOUSE, Material, PlaneBufferGeometry, TextureLoader,
  RepeatWrapping, MeshStandardMaterial, Mesh, ShaderMaterial, PMREMGenerator, Box3, LinearFilter, Group,
  CanvasTexture,
} from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import { Water } from 'three/examples/jsm/objects/Water2';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Sky } from 'three/examples/jsm/objects/Sky';
import * as TWEEN from '@tweenjs/tween.js';
import { Subscription } from 'rxjs';
import { Internal } from '../../../ws/ws-messages';
import { WsService } from '../../../ws/ws.service';
import { Boat } from '../../quacken/boats/boat';
import { BoatRender } from '../boat-render';
import { BoatService, flagMats } from '../boat.service';
import { Team } from '../../quacken/boats/types';
import { SettingsService } from '../../../settings/settings.service';

const sunSettings = {
  turbidity: 20,
  rayleigh: 4,
  mieCoefficient: 0.001,
  mieDirectionalG: 0.997,
  inclination: 0.4, // elevation / inclination
  azimuth: 0.25, // Facing front,
  exposure: 0.75,
};

// moonlight
// const sunSettings = {
//   turbidity: 20,
//   rayleigh: 0,
//   mieCoefficient: 0.001,
//   mieDirectionalG: 0.997,
//   inclination: 0.43, // elevation / inclination
//   azimuth: 0.25, // Facing front,
//   exposure: 0.7,
// };
export const GRID_DEPTH = -0.05;

export interface ObstacleConfig {
  path: string; ext?: string;
  offsetX: number; offsetZ: number; offsetY?: number;
  scalar?: number; scaleY?: number; rotate?: number;
}

const obstacleModels: Record<number, ObstacleConfig> = {
  21: { path: 'flag', offsetX: 0, offsetZ: 0, rotate: Math.PI },
  22: { path: 'flag2', offsetX: 0, offsetZ: 0, rotate: Math.PI },
  23: { path: 'flag3', offsetX: 0, offsetZ: 0, rotate: Math.PI },
  50: { path: 'rocks', offsetX: -0.15, offsetZ: -0.25 },
  51: { path: 'stylized_rocks', offsetX: 0, offsetZ: 0, scalar: 0.5, scaleY: 0.3 },
};

@Component({
  selector: 'q-threed-render',
  templateUrl: './threed-render.component.html',
  styleUrls: ['./threed-render.component.scss'],
  providers: [BoatService],
})
export class ThreedRenderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('frame') frame?: ElementRef;
  @ViewChild('fps') fps?: ElementRef;
  @Input() mapHeight = 36;
  @Input() mapWidth = 20;
  @Input() safeZone = true;
  @Input() graphicSettings = this.ss.prefetch('graphics');
  @Input() controlSettings = this.ss.prefetch('controls');

  @Input() hoveredTeam = -1;
  private alive = true;
  private sub = new Subscription();
  private myBoat = new Boat('');

  private scene = new Scene();
  private mapScene = new Scene();
  private camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  private controls?: MapControls;
  private renderer = new WebGLRenderer({ antialias: true });
  private frameRequested = true;
  private frameTarget = 0;
  private lastFrame = 0;
  private slowFrames = 0;
  private water?: Water;

  private tileGeometry?: BufferGeometry;
  private tiles = new Map<number, MeshBasicMaterial>();
  private tileObjects = new Map<number, Promise<GLTF>>();
  private mapObjects: Object3D[] = [];
  private stats?: Stats;
  private cameraTween?: TWEEN.Tween<Vector3>;
  private controlTween?: TWEEN.Tween<Vector3>;
  private mouse = new Vector2(0, 0);
  private mouseMoved = false;
  private rayCaster = new Raycaster();

  private overlay = new Group();
  private canvas?: HTMLCanvasElement;
  private overlayTexture?: CanvasTexture;

  constructor(
    private bs: BoatService,
    private ws: WsService,
    private ss: SettingsService,
    private ngZone: NgZone,
  ) {
    void bs.setScene(this.scene, this.loadObj, this.camera);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMappingExposure = sunSettings.exposure;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.autoClear = false;
    this.scene.fog = new Fog(0);

    const light = new AmbientLight(0x404040, 6); // soft white light
    this.scene.add(light);
    this.scene.add(this.overlay);

    this.buildWater();
    this.buildSky();

    window.addEventListener('resize', this.onWindowResize, false);
  }

  ngOnInit(): void {
    this.sub.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => this.myBoat = b));
    this.sub.add(this.ws.subscribe(Internal.CenterOnBoat, this.centerOnBoat.bind(this)));

    this.sub.add(this.ws.subscribe(Internal.Canvas, c => {
      if (this.canvas === c && this.overlayTexture) {
        this.overlayTexture.needsUpdate = true;
        return;
      }

      this.overlayTexture?.dispose();
      this.overlay.remove(...this.overlay.children);
      this.canvas = c;
      this.overlayTexture = new CanvasTexture(c);
      const mapObject = new Mesh(new PlaneBufferGeometry(25, 36), new MeshBasicMaterial({
        map: this.overlayTexture,
        transparent: true,
        depthWrite: false,
      }));
      mapObject.rotateX(-Math.PI / 2);
      mapObject.position.set(12.5, -0.04, 18);
      this.overlay.add(mapObject);
    }));

    this.buildGrid();
  }

  ngAfterViewInit(): void {
    this.frame?.nativeElement.appendChild(this.renderer.domElement);
    this.frame?.nativeElement.addEventListener('dblclick', this.centerOnBoat.bind(this));
    this.bs.map = this.frame?.nativeElement;

    this.camera.position.set(5, 15, 38);

    this.controls = new MapControls(this.camera, this.frame?.nativeElement);
    this.controls.maxPolarAngle = Math.PI * 15 / 32;
    this.controls.target = new Vector3(10, 0.3, 33);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.3;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 35;
    this.controls.rotateSpeed = 0.75;
    this.controls.addEventListener('change', this.requestRender);
    this.controls.update();
    this.bs.setControls(this.controls);

    this.stats = Stats();
    this.fps?.nativeElement.appendChild(this.stats.dom);
    this.stats.dom.style.position = 'relative';

    this.frameRequested = false;
    this.requestRender();
    this.frame?.nativeElement.addEventListener('mousemove', this.mouseMove, false);
    this.frame?.nativeElement.addEventListener('click', this.click, false);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.alive = false;
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    this.controls?.dispose();
    this.tileGeometry?.dispose();
    for (const [, m] of this.tiles) m.dispose();
    for (const [, o] of this.tileObjects) BoatService.dispose(o);
  }

  private centerOnBoat() {
    if (!this.myBoat.name) return;
    this.cameraTween?.end();
    this.controlTween?.end();
    const time = new Date().valueOf();
    const pos = this.myBoat.pos;
    this.cameraTween = new TWEEN.Tween(this.camera.position)
      .to({ x: pos.x - 2.5, y: 9, z: pos.y + 3.5 }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => delete this.cameraTween)
      .start(time);

    if (!this.controls || this.controlTween) return;
    this.controlTween = new TWEEN.Tween(this.controls.target)
      .to({ x: pos.x + 0.5, z: pos.y + 0.5 }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => delete this.controlTween)
      .start(time);
  }

  private mouseMove = (event: MouseEvent) => {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.mouseMoved = true;
  };

  private click = () => {
    this.bs.findClick(this.rayCaster.ray);
  };

  protected updateIntersects(): void {
    if (!this.mouseMoved && this.hoveredTeam === -1) return;
    this.rayCaster.setFromCamera(this.mouse, this.camera);
    this.bs.showInfluence(this.rayCaster.ray, this.hoveredTeam);
    this.mouseMoved = false;
  }

  private animate = () => {
    const t = new Date().valueOf();
    if (t < this.frameTarget) {
      this.frameRequested = false;
      this.requestRender();
      return;
    }
    if (this.graphicSettings.maxFps) {
      this.frameTarget = Math.max(t, this.frameTarget + 1000 / this.graphicSettings.maxFps.value);
    }

    this.render();
    this.updateIntersects();
    this.requestRender();
  };

  private requestRender = () => {
    if (!this.alive || this.frameRequested) return;
    this.frameRequested = true;
    this.ngZone.runOutsideAngular(() => window.requestAnimationFrame(this.animate));
  };

  private render = () => {
    if (!this.alive || !this.controls) return;
    this.bs.speed = this.graphicSettings.speed?.value || 15;
    BoatRender.speed = this.bs.speed;
    const time = new Date().valueOf();
    TWEEN.update(time);
    BoatRender.tweens.update(time);

    this.controls.mouseButtons.RIGHT = this.controlSettings.lockAngle ? MOUSE.PAN : MOUSE.ROTATE;
    if (time - this.lastFrame > 50 && this.slowFrames < 50) this.slowFrames++;
    else if (this.slowFrames > 0) this.slowFrames /= 2;
    this.lastFrame = time;
    if (this.slowFrames > 5 && this.graphicSettings.water) this.graphicSettings.water.value = 0;

    if (this.graphicSettings.water?.value && !this.water) this.buildWater();
    if (!this.graphicSettings.water?.value && this.water) {
      this.scene.remove(this.water);
      (this.water.material as Material).dispose();
      this.water.geometry.dispose();
      delete this.water;
    }

    if (this.scene.fog instanceof Fog) {
      this.scene.fog.near = this.camera.position.y;
      this.scene.fog.far = this.camera.position.y * 2 + 50;
    }

    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.render(this.mapScene, this.camera);

    this.frameRequested = false;
    this.controls?.update();
    this.stats?.update();
    // console.log(this.renderer.info.memory)
  };

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.requestRender();
  };

  private buildWater() {
    const waterGeometry = new PlaneBufferGeometry(10000, 10000);
    const floorGeo = new PlaneBufferGeometry(10000, 10000);
    const loader = new TextureLoader();
    const floorTex = loader.load('assets/images/kingwall.png');
    floorTex.wrapS = floorTex.wrapT = RepeatWrapping;
    floorTex.repeat = new Vector2(10, 10);
    const floorMat = new MeshStandardMaterial({ map: floorTex });
    const floor = new Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -10;
    this.scene.add(floor);

    this.water = new Water(waterGeometry, {
      color: '#9bd',
      scale: 1000,
      reflectivity: 0.1,
      flowDirection: new Vector2(0.15, 0.15),
      textureWidth: 1024,
      textureHeight: 1024,
      normalMap0: loader.load('assets/images/Water_1_M_Normal.jpg'),
      normalMap1: loader.load('assets/images/Water_2_M_Normal.jpg'),
    });

    this.water.rotation.x = -Math.PI / 2;
    (this.water.material as ShaderMaterial).fog = false;
    (this.water.material as ShaderMaterial).depthWrite = false;

    this.scene.add(this.water);
  }

  private buildSky() {
    const sky = new Sky();
    sky.scale.setScalar(450000);
    this.scene.add(sky);

    const sun = new Vector3();
    const pmremGenerator = new PMREMGenerator(this.renderer);

    const uniforms = sky.material.uniforms;
    if (uniforms.turbidity) uniforms.turbidity.value = sunSettings.turbidity;
    if (uniforms.rayleigh) uniforms.rayleigh.value = sunSettings.rayleigh;
    if (uniforms.mieCoefficient) uniforms.mieCoefficient.value = sunSettings.mieCoefficient;
    if (uniforms.mieDirectionalG) uniforms.mieDirectionalG.value = sunSettings.mieDirectionalG;

    const theta = Math.PI * (sunSettings.inclination - 0.5);
    const phi = 2 * Math.PI * (sunSettings.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    uniforms.sunPosition?.value.copy(sun);

    this.scene.environment = pmremGenerator.fromScene(sky as any).texture;
  }

  private loadObj(obj?: ObstacleConfig): Promise<GLTF> {
    if (!obj) return Promise.reject(new Error('Object not defined'));
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      loader.load('assets/models/' + obj.path + '/scene.' + (obj.ext || 'glb'), (gltf) => {
        gltf.scene.position.x = obj.offsetX;
        gltf.scene.position.z = obj.offsetZ;
        if (obj.scalar) gltf.scene.scale.setScalar(obj.scalar);
        if (obj.scaleY) gltf.scene.scale.setY(obj.scaleY);
        gltf.scene.position.y = -new Box3().setFromObject(gltf.scene).min.y - 0.25;
        gltf.scene.position.y += obj.offsetY || 0;
        if (obj.rotate) gltf.scene.rotateY(obj.rotate);
        resolve(gltf);
      }, undefined, console.error);
    });
  }

  protected buildGrid(): void {
    const grid = new Object3D();
    grid.position.y = GRID_DEPTH;
    let geometry = new PlaneBufferGeometry(this.mapWidth + 0.025, 0.025, this.mapWidth, 1);
    const material = new MeshBasicMaterial({ color: '#999', fog: false });
    let line = new Mesh(geometry, material).rotateX(-Math.PI / 2);
    line.position.x = this.mapWidth / 2;
    for (let i = 0; i <= this.mapHeight; i++) {
      grid.add(line);
      line = line.clone();
      line.position.z++;
    }

    geometry = new PlaneBufferGeometry(0.025, this.mapHeight, 1, this.mapHeight);
    line = new Mesh(geometry, material).rotateX(-Math.PI / 2);
    line.position.z = this.mapHeight / 2;
    for (let i = 0; i <= this.mapWidth; i++) {
      grid.add(line);
      line = line.clone();
      line.position.x++;
    }
    this.mapScene.add(grid);
    if (!this.safeZone) return;

    const szGeo = new PlaneBufferGeometry(20, 3);
    const szMat = new MeshBasicMaterial({ color: 'cyan', opacity: 0.3, transparent: true });
    let sz = new Mesh(szGeo, szMat);
    sz.renderOrder = 2;
    sz.rotateX(-Math.PI / 2);
    sz.position.x = 10;
    sz.position.z = 1.5;
    sz.position.y = -0.01;
    grid.add(sz);
    sz = sz.clone();
    sz.position.z += 33;
    grid.add(sz);
  }

  fillMap(map: number[][], flags: { x: number, y: number, t: Team, p: number, cs: number[] }[]): void {
    for (const o of this.mapObjects) o.parent?.remove(o);
    this.mapObjects = [];

    const geometry = this.tileGeometry || new PlaneBufferGeometry(1, 1).rotateX(-Math.PI / 2);
    this.tileGeometry = geometry;
    const loader = new TextureLoader();
    let square = new Mesh(geometry, new MeshBasicMaterial({ transparent: true, fog: false }));
    square.position.y = GRID_DEPTH;
    square.renderOrder = 2;
    let flagIndex = 0;
    this.bs.flags = [];

    for (let y = 0; y < map.length; y++) {
      const row = map[y];
      if (!row) break;
      for (let x = 0; x < row.length; x++) {
        const tile = row[x];
        if (!tile) continue;
        if (obstacleModels[tile]) {
          // load 3d
          let prom = this.tileObjects.get(tile);
          if (!prom) {
            prom = this.loadObj(obstacleModels[tile]).then(gltf => gltf);
            if (tile >= 21 && tile <= 23) {
              void prom.then(gltf => {
                const flag = gltf.scene.getObjectByName('flag');
                if (flag instanceof Mesh) flag.material?.dispose();
              });
            }
            this.tileObjects.set(tile, prom);
          }

          const thisFlag = flagIndex;
          if (tile <= 23) flagIndex++;
          void prom.then(model => {
            const newObj = model.scene.clone();
            const centered = new Group();
            centered.add(newObj);
            centered.position.x += x + 0.5;
            centered.position.z += y + 0.5;
            if (tile > 23) centered.rotateY(Math.round(Math.random() * 3) * Math.PI / 2);
            else {
              const flag = centered.getObjectByName('flag');
              if (flag instanceof Mesh) {
                flag.material = flagMats[flags[thisFlag]?.t || 0] || flag.material;
                this.bs.flags[thisFlag] = flag;
              }
            }
            this.scene.add(centered);
            this.mapObjects.push(centered);
          });
          continue;
        }
        // load 2d
        let mat = this.tiles.get(tile);
        if (!mat) {
          mat = square.material.clone();
          mat.map = loader.load('assets/images/obstacle' + tile + '.png');
          mat.map.minFilter = LinearFilter;
          mat.map.anisotropy = this.renderer.capabilities.getMaxAnisotropy() || 0;
          this.tiles.set(tile, mat);
        }
        square.position.x = 0.5 + x;
        square.position.z = 0.5 + y;
        square.material = mat;
        this.mapScene.add(square);
        this.mapObjects.push(square);
        square = square.clone();
      }
    }
  }
}
