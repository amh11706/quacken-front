import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';
import TWEEN from '@tweenjs/tween.js';

import { Boat } from '../quacken/boats/boat';
import { Settings } from 'src/app/settings/setting/settings';
import { QuackenComponent } from '../quacken/quacken.component';
import { SettingMap, SettingsService } from 'src/app/settings/settings.service';
import { InCmd, Internal } from 'src/app/ws-messages';
import { FriendsService } from 'src/app/chat/friends/friends.service';
import { WsService } from 'src/app/ws.service';
import { BoatService } from './boat.service';
import {
  WebGLRenderer,
  Scene,
  Fog,
  Object3D,
  ACESFilmicToneMapping,
  LinearFilter,
  AmbientLight,
  PMREMGenerator,
  PerspectiveCamera,
  MeshStandardMaterial,
  MeshBasicMaterial,
  LineBasicMaterial,
  ShaderMaterial,
  TextureLoader,
  RepeatWrapping,
  Geometry,
  PlaneBufferGeometry,
  PlaneGeometry,
  BufferGeometry,
  Vector2,
  Vector3,
  Box3,
  Line,
  Group,
  Mesh,
} from 'three';

const baseSettings: (keyof typeof Settings)[] = ['cadeSpeed'];
const ownerSettings: (keyof typeof Settings)[] = [
  'jobberQuality', 'cadePublicMode', 'cadeHotEntry',
  'cadeMaxPlayers', 'cadeMap',
];

export const CadeDesc = 'CadeGoose: Use your ship to contest flags and sink enemy ships in a battle for points.';

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
const GRID_DEPTH = 0.06;

export interface ObstacleConfig {
  path: string; ext?: string;
  offsetX: number; offsetZ: number; offsetY?: number;
  scalar?: number; scaleY?: number; rotate?: number;
}

const obstacleModels: Record<number, ObstacleConfig> = {
  50: { path: 'rocks', offsetX: -0.15, offsetZ: -0.25 },
  51: { path: 'stylized_rocks', offsetX: 0, offsetZ: 0, scalar: 0.5, scaleY: 0.25 },
};

@Component({
  selector: 'q-cadegoose',
  templateUrl: './cadegoose.component.html',
  styleUrls: ['./cadegoose.component.scss']
})
export class CadegooseComponent extends QuackenComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('frame') frame?: ElementRef;
  settings: SettingMap = { mapScale: 50, speed: 10 };
  hoveredTeam = -1;
  protected mapHeight = 36;
  protected mapWidth = 20;

  private scene = new Scene();
  private camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  private controls?: MapControls;
  private renderer = new WebGLRenderer();
  private frameRequested = true;
  private water?: Water;

  private tileGeometry?: Geometry;
  private tiles: Record<number, MeshBasicMaterial> = {};
  private tileObjects: Record<number, Promise<GLTF>> = {};
  private mapObjects: Object3D[] = [];
  private stats?: Stats;
  private cameraTween: any;
  private controlTween: any;

  constructor(
    protected ws: WsService,
    protected ss: SettingsService,
    protected fs: FriendsService,
    private bs: BoatService,
  ) {
    super(ws, ss, fs);
    bs.setScene(this.scene, this.loadObj, this.camera);

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMappingExposure = sunSettings.exposure;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.scene.fog = new Fog(0);

    const light = new AmbientLight(0x404040, 4); // soft white light
    this.scene.add(light);

    this.buildWater();
    this.buildSky();

    window.addEventListener('resize', this.onWindowResize, false);
  }

  ngOnInit() {
    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: CadeDesc } });
    this.ss.getGroup('l/cade', true);
    this.ss.setLobbySettings([...baseSettings, ...ownerSettings]);

    this.sub.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => this.myBoat = b));

    this.buildGrid();
  }

  ngAfterViewInit() {
    this.frame?.nativeElement.appendChild(this.renderer.domElement);
    this.frame?.nativeElement.addEventListener('dblclick', () => {
      if (!this.myBoat.isMe || this.cameraTween) return;
      const time = new Date().valueOf();
      const pos = this.myBoat.pos;
      this.cameraTween = new TWEEN.Tween(this.camera.position as any)
        .to({ x: pos.x - 2.5, y: 9, z: pos.y + 3.5 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => delete this.cameraTween)
        .start(time);

      if (!this.controls || this.controlTween) return;
      this.controlTween = new TWEEN.Tween(this.controls.target as any)
        .to({ x: pos.x + 0.5, z: pos.y + 0.5 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => delete this.controlTween)
        .start(time);
    });
    this.bs.map = this.frame?.nativeElement;

    this.camera.position.x = 5;
    this.camera.position.y = 15;
    this.camera.position.z = 38;

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
    this.frame?.nativeElement.appendChild(this.stats.dom);

    this.frameRequested = false;
    this.requestRender();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  private animate = () => {
    this.render();
    this.requestRender();
  }

  private requestRender = () => {
    if (this.frameRequested) return;
    this.frameRequested = true;
    requestAnimationFrame(this.animate);
  }

  private render = () => {
    this.bs.speed = this.settings.speed || 15;
    const time = new Date().valueOf();
    TWEEN.update(time);

    if (this.scene.fog instanceof Fog) {
      this.scene.fog.near = this.camera.position.y;
      this.scene.fog.far = this.camera.position.y * 2 + 50;
    }

    this.renderer.render(this.scene, this.camera);

    this.frameRequested = false;
    this.controls?.update();
    this.stats?.update();
  }

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.requestRender();
  }

  private buildWater() {
    const waterGeometry = new PlaneBufferGeometry(10000, 10000);
    const floorGeo = new PlaneGeometry(10000, 10000);
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

    this.water.rotation.x = - Math.PI / 2;
    (this.water.material as ShaderMaterial).fog = false;

    this.scene.add(this.water);
  }

  private buildSky() {
    const sky = new Sky();
    sky.scale.setScalar(450000);
    this.scene.add(sky);

    const sun = new Vector3();
    const pmremGenerator = new PMREMGenerator(this.renderer);

    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value = sunSettings.turbidity;
    uniforms['rayleigh'].value = sunSettings.rayleigh;
    uniforms['mieCoefficient'].value = sunSettings.mieCoefficient;
    uniforms['mieDirectionalG'].value = sunSettings.mieDirectionalG;

    const theta = Math.PI * (sunSettings.inclination - 0.5);
    const phi = 2 * Math.PI * (sunSettings.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    uniforms.sunPosition.value.copy(sun);

    this.scene.environment = pmremGenerator.fromScene(sky as any).texture;
  }

  private loadObj(obj: ObstacleConfig): Promise<GLTF> {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      loader.load('assets/models/' + obj.path + '/scene.' + (obj.ext || 'gltf'), (gltf) => {
        gltf.scene.position.x = obj.offsetX;
        gltf.scene.position.z = obj.offsetZ;
        if (obj.scalar) gltf.scene.scale.setScalar(obj.scalar);
        if (obj.scaleY) gltf.scene.scale.setY(obj.scaleY);
        gltf.scene.position.y = -new Box3().setFromObject(gltf.scene).min.y - 0.25;
        gltf.scene.position.y += obj.offsetY || 0;
        if (obj.rotate) gltf.scene.rotateY(obj.rotate);
        resolve(gltf);
      }, undefined, function (error) {
        console.error(error);
      });
    });
  }

  private buildGrid() {
    const grid = new Object3D();
    grid.position.y = GRID_DEPTH;
    let points: Vector3[] = [];
    for (let i = 0; i <= this.map[0].length; i++) {
      points.push(new Vector3(i, 0, 0));
    }
    let geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ color: '#aaa', fog: false });
    let line = new Line(geometry, material);
    for (let i = 0; i <= this.map.length; i++) {
      grid.add(line);
      line = line.clone();
      line.position.z++;
    }

    points = [];
    for (let i = 0; i <= this.map.length; i++) {
      points.push(new Vector3(0, 0, i));
    }
    geometry = new BufferGeometry().setFromPoints(points);
    line = new Line(geometry, material);
    for (let i = 0; i <= this.map[0].length; i++) {
      grid.add(line);
      line = line.clone();
      line.position.x++;
    }

    const szGeo = new PlaneGeometry(20, 3);
    const szMat = new MeshBasicMaterial({ color: 'cyan', opacity: 0.3, transparent: true });
    let sz = new Mesh(szGeo, szMat);
    sz.renderOrder = 2;
    sz.rotateX(-Math.PI / 2);
    sz.position.x = 10;
    sz.position.z = 1.5;
    sz.position.y = -GRID_DEPTH - 0.05;
    grid.add(sz);
    sz = sz.clone();
    sz.position.z += 33;
    grid.add(sz);

    this.scene.add(grid);
  }

  protected setMapB64(map: string) {
    super.setMapB64(map);
    this.fillMap();
  }

  private fillMap() {
    this.scene.remove(...this.mapObjects);
    this.mapObjects = [];

    const geometry = this.tileGeometry || new PlaneGeometry(1, 1);
    geometry.rotateX(-Math.PI / 2);
    this.tileGeometry = geometry;
    const loader = new TextureLoader();
    let square = new Mesh(geometry, new MeshBasicMaterial({ transparent: true, fog: false }));
    square.position.y = GRID_DEPTH;
    square.renderOrder = 2;

    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        const tile = this.map[y][x];
        if (!tile) continue;
        if (obstacleModels[tile]) {
          // load 3d
          let prom = this.tileObjects[tile];
          if (!prom) {
            prom = this.loadObj(obstacleModels[tile]);
            this.tileObjects[tile] = prom;
          }
          prom.then(model => {
            const newObj = model.scene.clone();
            const centered = new Group();
            centered.add(newObj);
            centered.position.x += x + 0.5;
            centered.position.z += y + 0.5;
            centered.rotateY(Math.round(Math.random() * 3) * Math.PI / 2);
            this.scene.add(centered);
            this.mapObjects.push(newObj);
          });
          continue;
        }
        // load 2d
        let mat = this.tiles[tile];
        if (!mat) {
          mat = square.material.clone();
          mat.map = loader.load('assets/images/obstacle' + tile + '.png');
          mat.map.minFilter = LinearFilter;
          mat.map.anisotropy = this.renderer.capabilities.getMaxAnisotropy() || 0;
          this.tiles[tile] = mat;
        }
        square.position.x = 0.5 + x;
        square.position.z = 0.5 + y;
        square.material = mat;
        this.scene.add(square);
        this.mapObjects.push(square);
        square = square.clone();
      }
    }
  }

  async getSettings() {
    this.settings = await this.ss.getGroup('cade');
  }

}
