import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import TWEEN from '@tweenjs/tween.js';

import { Boat } from '../quacken/boats/boat';
import { Settings } from 'src/app/settings/setting/settings';
import { QuackenComponent } from '../quacken/quacken.component';
import { SettingMap, SettingsService } from 'src/app/settings/settings.service';
import { InCmd, Internal } from 'src/app/ws-messages';
import { FriendsService } from 'src/app/chat/friends/friends.service';
import { WsService } from 'src/app/ws.service';
import { BoatService } from './boat.service';

const baseSettings: (keyof typeof Settings)[] = ['cadeMapScale', 'cadeSpeed'];
const ownerSettings: (keyof typeof Settings)[] = [
  'jobberQuality', 'cadePublicMode', 'cadeHotEntry',
  'cadeMaxPlayers', 'cadeMap',
];

export const CadeDesc = 'CadeGoose: Use your ship to contest flags and sink enemy ships in a battle for points.';

const sunSettings = {
  turbidity: 10,
  rayleigh: 3.33,
  mieCoefficient: 0.001,
  mieDirectionalG: 0.995,
  inclination: 0.48, // elevation / inclination
  azimuth: 0.25, // Facing front,
  exposure: 0.7,
};
const GRID_DEPTH = -0.2;

export interface ObstacleConfig {
  path: string; ext?: string;
  offsetX: number; offsetZ: number; offsetY?: number;
  scalar?: number; scaleY?: number; rotate?: number;
}

const obstacleModels: Record<number, ObstacleConfig> = {
  50: { path: 'rocks', offsetX: 0.35, offsetZ: 0.25 },
  51: { path: 'stylized_rocks', offsetX: 0.5, offsetZ: 0.5, scalar: 0.5, scaleY: 0.25 },
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

  private scene = new THREE.Scene();
  private sunScene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  private controls?: MapControls;
  private renderer = new THREE.WebGLRenderer();
  private lastFrame = 0;
  private frameRequested = true;
  private water?: Water;

  private tileGeometry?: THREE.Geometry;
  private tiles: Record<number, THREE.MeshStandardMaterial> = {};
  private tileObjects: Record<number, GLTF> = {};
  private mapObjects: THREE.Object3D[] = [];
  private stats?: Stats;

  constructor(
    protected ws: WsService,
    protected ss: SettingsService,
    protected fs: FriendsService,
    private bs: BoatService,
  ) {
    super(ws, ss, fs);
    bs.setScene(this.scene, this.loadObj);

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.autoClear = false;

    const light = new THREE.AmbientLight(0x404040, 7); // soft white light
    this.scene.add(light);

    this.buildWater();
    this.buildSky();

    window.addEventListener('resize', this.onWindowResize, false);
  }

  async ngOnInit() {
    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: CadeDesc } });
    this.ss.getGroup('l/cade', true);
    this.ss.setLobbySettings([...baseSettings, ...ownerSettings]);

    this.sub.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => this.myBoat = b));

    this.buildGrid();
  }

  ngAfterViewInit() {
    this.frame?.nativeElement.appendChild(this.renderer.domElement);

    this.camera.position.x = 5;
    this.camera.position.y = 15;
    this.camera.position.z = 38;

    this.controls = new MapControls(this.camera, this.frame?.nativeElement);
    this.controls.maxPolarAngle = Math.PI * 15 / 32;
    this.controls.target = new THREE.Vector3(10, 0.3, 33);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.3;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 35;
    this.controls.rotateSpeed = 0.75;
    this.controls.addEventListener('change', this.requestRender);
    this.controls.update();

    this.stats = Stats();
    this.frame?.nativeElement.appendChild(this.stats.dom);

    this.lastFrame = new Date().valueOf();
    this.frameRequested = false;
    this.requestRender();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  private animate = (t: number) => {
    this.render(t);
    this.requestRender();
  }

  private requestRender = () => {
    if (this.frameRequested) return;
    this.frameRequested = true;
    requestAnimationFrame(this.animate);
  }

  private render = (t: number) => {
    const time = new Date().valueOf();
    if (this.water) {
      (this.water.material as THREE.ShaderMaterial).uniforms['time'].value += (time - this.lastFrame) / 5000;
    }
    TWEEN.update(t);
    this.lastFrame = time;

    this.renderer.clear();
    this.renderer.toneMapping = 0;
    this.renderer.render(this.scene, this.camera);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.render(this.sunScene, this.camera);

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
    const waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);

    this.water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('assets/images/waternormals.jpg', function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        alpha: 0.6,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xaaaaaa,
        waterColor: 0x001e0f,
        distortionScale: 6,
        fog: this.scene.fog !== undefined
      }
    );

    this.water.rotation.x = - Math.PI / 2;

    const material = this.water.material as THREE.ShaderMaterial;
    material.transparent = true;
    material.uniforms.size.value = 50;

    this.water.renderOrder = 2;
    this.scene.add(this.water);
  }

  private buildSky() {
    const sky = new Sky();
    sky.scale.setScalar(450000);
    this.scene.add(sky);

    const sky2 = new Sky();
    sky2.scale.setScalar(400000);
    this.sunScene.add(sky2);

    const sun = new THREE.Vector3();
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

    const uniforms = sky.material.uniforms;
    sky2.material.uniforms = uniforms;
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
    (this.water?.material as THREE.ShaderMaterial).uniforms['sunDirection'].value.copy(sun).normalize();

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
        gltf.scene.position.y = -new THREE.Box3().setFromObject(gltf.scene).min.y - 0.25;
        gltf.scene.position.y += obj.offsetY || 0;
        if (obj.rotate) gltf.scene.rotateY(obj.rotate);
        resolve(gltf);
      }, undefined, function (error) {
        console.error(error);
      });
    });
  }

  private buildGrid() {
    const grid = new THREE.Object3D();
    grid.position.y = GRID_DEPTH;
    let points: THREE.Vector3[] = [];
    for (let i = 0; i <= this.map[0].length; i++) {
      points.push(new THREE.Vector3(i, 0, 0));
    }
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: '#fff' });
    let line = new THREE.Line(geometry, material);
    for (let i = 0; i <= this.map.length; i++) {
      grid.add(line);
      line = line.clone();
      line.position.z++;
    }

    points = [];
    for (let i = 0; i <= this.map.length; i++) {
      points.push(new THREE.Vector3(0, 0, i));
    }
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    line = new THREE.Line(geometry, material);
    for (let i = 0; i <= this.map[0].length; i++) {
      grid.add(line);
      line = line.clone();
      line.position.x++;
    }

    const szGeo = new THREE.PlaneGeometry(20, 3);
    const szMat = new THREE.MeshBasicMaterial({ color: 'cyan', opacity: 0.2, transparent: true });
    let sz = new THREE.Mesh(szGeo, szMat);
    sz.rotateX(-Math.PI / 2);
    sz.position.x = 10;
    sz.position.z = 1.5;
    sz.position.y = -0.01;
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

    const geometry = this.tileGeometry || new THREE.PlaneGeometry(1, 1);
    geometry.rotateX(-Math.PI / 2);
    this.tileGeometry = geometry;
    const loader = new THREE.TextureLoader();
    let square = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ transparent: true }));
    square.position.y = GRID_DEPTH;
    const objs: { x: number, y: number, tile: number }[] = [];

    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        const tile = this.map[y][x];
        if (tile > 0) {
          if (obstacleModels[tile]) {
            // load 3d
            objs.push({ x, y, tile });

          } else {
            // load 2d
            let mat = this.tiles[tile];
            if (!mat) {
              mat = square.material.clone();
              mat.map = loader.load('assets/images/obstacle' + tile + '.png');
              mat.map.minFilter = THREE.LinearFilter;
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
    }

    setTimeout(async () => {
      for (const o of objs) {
        let model = this.tileObjects[o.tile];
        if (!model) {
          model = await this.loadObj(obstacleModels[o.tile]);
          this.tileObjects[o.tile] = model;
        }
        const newObj = model.scene.clone();
        newObj.position.x += o.x;
        newObj.position.z += o.y;
        this.scene.add(newObj);
        this.mapObjects.push(newObj);
      }
    });
  }

  async getSettings() {
    this.settings = await this.ss.getGroup('cade');
  }

}
