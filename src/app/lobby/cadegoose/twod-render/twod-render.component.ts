import { Component, OnInit, ViewChild, ElementRef, Input, NgZone, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import Stats from 'three/examples/jsm/libs/stats.module';

import { SettingsService, SettingMap } from '../../../settings/settings.service';
import { InCmd, Internal } from '../../../ws-messages';
import { WsService } from '../../../ws.service';
import { MapEditor, MapTile } from '../../../map-editor/map-editor.component';
import { Boat } from '../../quacken/boats/boat';
import { Sprite, SpriteImage } from './sprite';
import { BigRockData } from './objects/big_rock';
import { SmallRockData } from './objects/small_rock';
import { FlagData } from './objects/flags';
import { GuBoat, Point, Position } from './gu-boats/gu-boat';
import { BoatRender } from '../boat-render';
import { MapComponent } from '../../../map-editor/map/map.component';
import { Lobby } from '../../lobby.component';
import { FlagColorOffsets } from '../canvas/canvas.component';

type flagIndex = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14';
type index = '0' | '1' | '2' | '3';
@Component({
  selector: 'q-twod-render',
  templateUrl: './twod-render.component.html',
  styleUrls: ['./twod-render.component.scss'],
})
export class TwodRenderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasElement?: ElementRef<HTMLCanvasElement>;
  @ViewChild('fps') fps?: ElementRef<HTMLElement>;
  @ViewChild('frame') frame?: ElementRef<HTMLElement>;
  @Input() lobby: Lobby | undefined;
  @Input() hoveredTeam = -1;
  @Input() mapHeight = 36;
  @Input() mapWidth = 20;
  @Input() safeZone = true;
  @Input() myBoat = new Boat('');
  @Input() speed = 15;
  @Input() fishBoats = 0;
  @Input() set map(map: number[][]) { void this.fillMap(map, []); }
  private mapUtil = new MapComponent();
  @Input() set editor(e: MapEditor) { this.mapUtil.map = e; }
  @Input() set undo(u: (source: MapTile[][], target: MapTile[][]) => void) { this.mapUtil.undo = u; }
  @Input() set setTile(st: (x: number, y: number, v: number) => MapTile | undefined) { this.mapUtil.setTile = st; }
  @Input() ctrlZoom = false;
  private _mapScale = 1;
  private _mapScaleRaw = 50;
  @Input() set mapScale(v: number) {
    this._mapScale = +v / 50;
    this._mapScaleRaw = +v;
  }

  get mapScale(): number { return this._mapScale; }
  @Input() graphicSettings: SettingMap = {
    mapScale: { value: 50 },
    speed: { value: 10 },
    water: { value: 1 },
    showFps: { value: 0 },
  };

  private frameRequested = true;
  private frameTarget = 0;
  private alive = true;
  private stats?: Stats;

  private water = new Sprite('cell', 64, 48, [[128, 0]]);
  private sz = new Sprite('safezone', 64, 48, [[128, 0]]);
  private wind = new Sprite('wind', 64, 48, [[192, 0], [0, 0], [64, 0], [128, 0]]);
  private whirl = new Sprite('whirl', 64, 48, [[64, 0], [128, 0], [192, 0], [0, 0]]);

  private wheelDebounce?: number;
  private sub = new Subscription();
  private canvas?: CanvasRenderingContext2D | null;

  obstacles: { t: number, points?: number, cs?: number[], zIndex: number, sprite: SpriteImage }[] = [];
  flags: { t: number, points?: number, cs?: number[], zIndex: number, sprite: SpriteImage }[] = [];
  getX = (p: { x: number, y: number }): number => (p.x + p.y) * 32;
  getY = (p: { x: number, y: number }): number => (p.y - p.x + this.mapWidth - 1) * 24;
  getXOff = (boat: Boat): number => (boat.render as GuBoat)?.coords?.x || this.getWidth() / 2;
  getYOff = (boat: Boat): number => (boat.render as GuBoat)?.coords?.y || this.getHeight() / 2;

  moveTransition = (transition: number): string => {
    switch (transition) {
      case 0: return '0s linear';
      case 1: return 10 / this.speed + 's linear';
      case 2: return 10 / this.speed + 's ease-in';
      case 3: return 10 / this.speed + 's ease-out';
      case 4: return '.1s linear';
      default: return '';
    }
  }

  constructor(
    private ss: SettingsService,
    private ws: WsService,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    GuBoat.widthOffset = this.mapWidth - 1;
    this.sub.add(this.ws.subscribe(InCmd.Turn, (t) => {
      for (let i = 0; i < this.flags.length; i++) {
        const flag = this.flags[i];
        if (flag) flag.t = t.flags[i].t;
      }
      this.colorFlags();
    }));
    this.sub.add(this.ws.subscribe(Internal.CenterOnBoat, () => {
      if (!this.myBoat.name) return;
      this.frame?.nativeElement.dispatchEvent(new Event('dblclick'));
    }));

    this.frameRequested = false;
    this.ngZone.runOutsideAngular(this.requestRender.bind(this));
  }

  ngAfterViewInit(): void {
    this.stats = Stats();
    this.fps?.nativeElement.appendChild(this.stats.dom);
    this.stats.dom.style.position = 'relative';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.alive = false;
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

    BoatRender.speed = this.speed;
    if (BoatRender.tweens.getAll().length) {
      BoatRender.tweens.update(t);
      this.cd.detectChanges();
    }
    this.stats?.update();
    this.frameRequested = false;
    this.requestRender();
  }

  private requestRender = () => {
    if (!this.alive || this.frameRequested) return;
    this.frameRequested = true;
    window.requestAnimationFrame(this.animate);
  }

  getHeight(): number {
    return (this.mapWidth + this.mapHeight) * 24;
  }

  getWidth(): number {
    return (this.mapWidth + this.mapHeight) * 32;
  }

  colorFlags(): void {
    if (this.flags.length === 0) return;
    for (const f of this.flags) {
      if (f.points === undefined) continue;
      const team = f.t !== undefined && f.t === this.myBoat.team ? 98 : f.t;
      const offset = FlagColorOffsets[team] ?? FlagColorOffsets[99] ?? 9;
      const pixel = FlagData.orientations[(f.points + offset).toString() as flagIndex];
      f.sprite.imgPosition = `-${pixel.x}px -${pixel.y}px`;
      f.sprite.orientation = pixel;
    }
  }

  public addObstacles(
    x: number, y: number, tile: number, flags: { t: number, points?: number, cs?: number[] }[],
  ): void {
    const obstacle = new Point().fromPosition({ x, y });
    const pOffsetX = obstacle.x;
    const pOffsetY = obstacle.y;
    const rand = this.ctrlZoom ? 0 : Math.floor(Math.random() * 4);
    if (tile >= 21 && tile <= 23) {
      const flag = new SpriteImage(FlagData);
      flag.pOffsetX = pOffsetX;
      flag.pOffsetY = pOffsetY;
      const flagObj = {
        t: flags?.shift()?.t || 99,
        points: tile - 21,
        zIndex: (pOffsetY - 23),
        sprite: flag,
      };
      this.obstacles.push(flagObj);
      this.flags.push(flagObj);
    } else if (tile === 50) {
      const bigRock = new SpriteImage(BigRockData);
      bigRock.pOffsetX = pOffsetX;
      bigRock.pOffsetY = pOffsetY;
      bigRock.orientation = BigRockData.orientations[rand.toString() as index];
      bigRock.imgPosition = `-${bigRock.orientation.x}px -${bigRock.orientation.y}px`;
      this.obstacles.push({ t: tile, zIndex: (pOffsetY - 10), sprite: bigRock });
    } else if (tile === 51) {
      const smallRock = new SpriteImage(SmallRockData);
      smallRock.pOffsetX = pOffsetX;
      smallRock.pOffsetY = pOffsetY;
      smallRock.orientation = SmallRockData.orientations[rand.toString() as index];
      smallRock.imgPosition = `-${smallRock.orientation.x}px -${smallRock.orientation.y}px`;
      this.obstacles.push({ t: tile, zIndex: (pOffsetY - 10), sprite: smallRock });
    }
  }

  async fillMap(map: number[][], flags: any[]): Promise<void> {
    await Promise.all([this.wind.prom, this.whirl.prom, this.water.prom, this.sz.prom]);
    const wasLoaded = !!this.canvas;
    if (!this.canvas) {
      this.canvas = this.canvasElement?.nativeElement.getContext('2d');
    }
    if (!this.canvas) return;
    const ctx = this.canvas;
    if (wasLoaded) {
      ctx.clearRect(0, -(this.mapWidth * 24 - 24), this.getWidth(), this.getHeight());
    } else {
      ctx.translate(0, this.mapWidth * 24 - 24);
    }
    this.obstacles = [];
    this.flags = [];
    ctx.save();
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const xOffset = (x + y) * 32;
        const yOffset = (-x + y) * 24;
        if (this.safeZone && (y > 32 || y < 3)) this.sz.draw(ctx, 0, xOffset, yOffset);
        else this.water.draw(ctx, 0, xOffset, yOffset);
        const tile = map[y]?.[x];
        if (!tile) continue;
        else if ((tile >= 21 && tile <= 23) || tile === 50 || tile === 51) this.addObstacles(x, y, tile, flags);
        else if (tile > 8) this.whirl.draw(ctx, (tile - 1) % 4, xOffset, yOffset);
        else if (tile > 4) this.wind.draw(ctx, (tile - 1) % 4, xOffset, yOffset);
      }
    }
    ctx.restore();
    this.colorFlags();
  }

  scroll(e: WheelEvent): void {
    if (this.ctrlZoom && !e.ctrlKey) return;
    if (e.deltaY < 0) {
      this._mapScaleRaw *= 21 / 20;
      if (this._mapScaleRaw > 100) this._mapScaleRaw = 100;
    } else {
      this._mapScaleRaw *= 20 / 21;
      if (this._mapScaleRaw < 15) this._mapScaleRaw = 15;
    }
    this._mapScaleRaw = Math.round(this._mapScaleRaw);
    this.mapScale = this._mapScaleRaw;
    e.preventDefault();
    this.saveScale();
  }

  extractCoord(event: MouseEvent): Position {
    const rect = this.canvasElement?.nativeElement.getBoundingClientRect();
    if (!rect) throw new Error('canvas bounding box not found!');
    const x = (event.clientX - rect.left) / this.mapScale;
    const y = ((event.clientY - rect.top - 24) / this.mapScale);
    const position = new Position().fromPoint({ x, y });
    position.x = Math.floor(position.x);
    position.y = Math.floor(position.y);
    return position;
  }

  mousedown(event: MouseEvent): void {
    const p = this.extractCoord(event);
    this.mapUtil.clickTile(event, p.x, p.y);
  }

  mouseup(event: MouseEvent): void {
    const p = this.extractCoord(event);
    this.mapUtil.mouseUp(event, p.x, p.y);
  }

  mousemove(event: MouseEvent): void {
    if (!this.mapUtil.painting) return;
    const p = this.extractCoord(event);
    this.mapUtil.clickTile(event, p.x, p.y);
  }

  private saveScale() {
    clearTimeout(this.wheelDebounce);
    this.wheelDebounce = window.setTimeout(() => {
      void this.ss.save({ id: 2, value: this._mapScaleRaw, name: 'mapScale', title: '', group: 'graphics' });
    }, 1000);
  }
}
