import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { Boat } from '../quacken/boats/boat';
import { Settings } from 'src/app/settings/setting/settings';
import { QuackenComponent } from '../quacken/quacken.component';
import { SettingMap } from 'src/app/settings/settings.service';
import { InCmd, Internal } from 'src/app/ws-messages';

const baseSettings: (keyof typeof Settings)[] = ['cadeMapScale', 'cadeSpeed'];
const ownerSettings: (keyof typeof Settings)[] = [
  'jobberQuality', 'cadePublicMode', 'cadeHotEntry',
  'cadeMaxPlayers', 'cadeMap',
];

export const CadeDesc = 'CadeGoose: Use your ship to contest flags and sink enemy ships in a battle for points.';

@Component({
  selector: 'q-cadegoose',
  templateUrl: './cadegoose.component.html',
  styleUrls: ['./cadegoose.component.scss']
})
export class CadegooseComponent extends QuackenComponent implements OnInit, AfterViewInit {
  @ViewChild('frame') frame?: ElementRef;
  settings: SettingMap = { mapScale: 50, speed: 10 };
  hoveredTeam = -1;
  protected mapHeight = 36;
  protected mapWidth = 20;

  private scene = new THREE.Scene();
  private gridScene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  private controls?: MapControls;
  private renderer = new THREE.WebGLRenderer();
  private frameRequested = false;
  private tiles: Record<number, THREE.MeshBasicMaterial> = {};

  ngOnInit() {
    this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: CadeDesc } });
    this.ss.getGroup('l/cade', true);
    this.ss.setLobbySettings([...baseSettings, ...ownerSettings]);

    this.sub.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => this.myBoat = b));
  }

  ngAfterViewInit() {
    this.renderer.autoClear = false;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.frame?.nativeElement.appendChild(this.renderer.domElement);

    this.camera.position.x = 10;
    this.camera.position.y = 10;
    this.camera.position.z = 10;

    this.controls = new MapControls(this.camera, this.frame?.nativeElement);
    this.controls.maxPolarAngle = Math.PI * 7 / 16;
    this.controls.target = new THREE.Vector3(5, 0, 5);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.3;
    this.controls.addEventListener('change', () => {
      if (this.frameRequested) return;
      this.frameRequested = true;
      requestAnimationFrame(this.render);
    });
    this.controls.update();

    this.buildGrid();
    this.fillMap();
    this.render();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.render();
  }

  private render = () => {
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.clearDepth();
    this.renderer.render(this.gridScene, this.camera);
    this.frameRequested = false;
    this.controls?.update();
  }


  private buildGrid() {
    const grid = new THREE.Object3D();
    grid.position.y = -0.01;
    let points: THREE.Vector3[] = [];
    for (let i = 0; i <= this.map[0].length; i++) {
      points.push(new THREE.Vector3(i, 0, 0));
    }
    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 'darkgrey' });
    let line = new THREE.Line(geometry, material);
    for (let i = 0; i <= this.map.length; i++) {
      grid.add(line);
      line = line.clone();
      line.position.z++;
    }

    geometry.dispose();
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
    geometry.dispose();
    material.dispose();
    this.gridScene.add(grid);
  }

  private fillMap() {
    const geometry = new THREE.BoxGeometry(1, 0, 1);
    const loader = new THREE.TextureLoader();
    const water = loader.load('assets/images/water.png', this.render);
    const material = new THREE.MeshBasicMaterial({ map: water, transparent: true });
    let square = new THREE.Mesh(geometry, material);
    material.dispose();

    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        square.position.x = 0.5 + x;
        square.position.z = 0.5 + y;
        this.scene.add(square);

        const tile = this.map[y][x];
        if (tile > 0) {
          let mat = this.tiles[tile];
          if (!mat) {
            mat = square.material.clone();
            mat.map = loader.load('assets/images/obstacle' + tile + '.png', this.render);
            this.tiles[tile] = mat;
          }
          const toPlace = square.clone();
          toPlace.material = mat;
          toPlace.position.y = 0.01;
          this.scene.add(toPlace);
        }
        square = square.clone();
      }
    }
    geometry.dispose();
  }

  async getSettings() {
    this.settings = await this.ss.getGroup('cade');
  }

  saveScale() {
    clearTimeout(this.wheelDebounce);
    this.wheelDebounce = window.setTimeout(() => {
      this.ss.save({ id: 22, value: this.settings.mapScale, name: 'mapScale', group: 'cade' });
    }, 1000);
  }

}
