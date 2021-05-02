import { Component, OnInit, ViewChild, ElementRef, Input, NgZone, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Boat } from '../../quacken/boats/boat';
import { Subscription } from 'rxjs';
import { SettingsService, SettingMap } from 'src/app/settings/settings.service';
import { Sprite, JsonSprite } from './sprite';
import { BigRockData } from './objects/big_rock';
import { SmallRockData } from './objects/small_rock';
import { InCmd, Internal } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { GuBoat } from './gu-boats/gu-boat';
import { BoatRender } from '../boat-render';
import Stats from 'three/examples/jsm/libs/stats.module';

const FlagColorOffsets: Record<number, number> = {
  0: 0,
  1: 3,
  98: 6,
  99: 9,
  100: 12,
};

@Component({
  selector: 'q-twod-render',
  templateUrl: './twod-render.component.html',
  styleUrls: ['./twod-render.component.scss'],
})
export class TwodRenderComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasElement?: ElementRef<HTMLCanvasElement>;
  @ViewChild('flagCanvas', { static: true }) flagCanvasElement?: ElementRef<HTMLCanvasElement>;
  @ViewChild('fps') fps?: ElementRef<HTMLElement>;
  @ViewChild('frame') frame?: ElementRef<HTMLElement>;
  @Input() hoveredTeam = -1;
  @Input() mapHeight = 36;
  @Input() mapWidth = 20;
  @Input() safeZone = true;
  @Input() myBoat = new Boat('');
  @Input() speed = 15;
  private _mapScale = 1;
  private _mapScaleRaw = 50;
  @Input() set mapScale(v: number) {
    this._mapScale = +v / 50;
    this._mapScaleRaw = +v;
  }
  get mapScale() { return this._mapScale; }

  @Input() graphicSettings: SettingMap = { mapScale: { value: 50 }, speed: { value: 10 }, water: { value: 1 }, showFps: { value: 0 } };
  private frameRequested = true;
  private frameTarget = 0;
  private alive = true;
  private stats?: Stats;

  private wheelDebounce?: number;
  private sub = new Subscription();
  private canvas?: CanvasRenderingContext2D | null;
  private flagCanvas?: CanvasRenderingContext2D | null;
  private flags: { x: number, y: number, t: number, points: number, cs: number[] }[] = [];
  private flag = new Sprite('buoy', 50, 69, [
    [50, 0], [50, 69], [50, 138],
    [100, 0], [100, 69], [100, 138],
    [0, 0], [0, 69], [0, 138],
    [250, 0], [250, 69], [250, 138],
    [200, 0], [200, 69], [200, 138],
  ]);

  getX = (p: { x: number, y: number }): number => (p.x + p.y) * 32;
  getY = (p: { x: number, y: number }): number => (p.y - p.x + this.mapWidth - 1) * 24;
  getXOff = (boat: Boat): number => (boat.render as GuBoat)?.coords?.x || 0;
  getYOff = (boat: Boat): number => (boat.render as GuBoat)?.coords?.y || 0;

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
        this.flags[i].t = t.flags[i].t;
      }
      this.drawFlags();
    }));
    this.sub.add(this.ws.subscribe(Internal.CenterOnBoat, () => {
      if (!this.myBoat.name) return;
      this.frame?.nativeElement.dispatchEvent(new Event('dblclick'));
    }));

    this.frameRequested = false;
    this.ngZone.runOutsideAngular(this.requestRender.bind(this));
  }

  ngAfterViewInit() {
    this.stats = Stats();
    this.fps?.nativeElement.appendChild(this.stats.dom);
    this.stats.dom.style.position = 'relative';
  }

  ngOnDestroy() {
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
    if (this.graphicSettings.maxFps) this.frameTarget = Math.max(t, this.frameTarget + 1000 / this.graphicSettings.maxFps.value);

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
    requestAnimationFrame(this.animate);
  }

  getHeight() {
    return (this.mapWidth + this.mapHeight) * 24;
  }

  getWidth() {
    return (this.mapWidth + this.mapHeight) * 32;
  }

  private async drawFlags() {
    if (!this.flagCanvas || this.flags.length === 0) return;
    await this.flag.prom;
    this.flagCanvas.clearRect(0, -(this.mapWidth * 24 - 24), this.getWidth(), this.getHeight());

    for (const f of this.flags) {
      if (f.t === undefined) return;
      const team = f.t === this.myBoat.team ? 98 : f.t;
      const offset = FlagColorOffsets[team];
      const x = (f.x + f.y) * 32;
      const y = (-f.x + f.y) * 24;
      this.flag.draw(this.flagCanvas, f.points + offset, x + 7, y - 33);
    }
  }

  async fillMap(map: number[][], flags: any[]) {
    const wasLoaded = !!this.canvas;
    if (!this.canvas) {
      this.canvas = this.canvasElement?.nativeElement.getContext('2d');
      this.flagCanvas = this.flagCanvasElement?.nativeElement.getContext('2d');
    }
    if (!this.canvas || !this.flagCanvas) return;
    const water = new Sprite('cell', 64, 48, [[128, 0]]);
    const sz = new Sprite('safezone', 64, 48, [[128, 0]]);
    await Promise.all([water.prom, sz.prom]);
    const ctx = this.canvas;
    if (wasLoaded) {
      ctx.clearRect(0, -(this.mapWidth * 24 - 24), this.getWidth(), this.getHeight());
    } else {
      ctx.translate(0, this.mapWidth * 24 - 24);
      this.flagCanvas.translate(0, this.mapWidth * 24 - 24);
    }
    this.flags = [];

    const tiles: { x: number, y: number, tile: number }[] = [];
    ctx.save();
    let i = 0;
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        if (this.safeZone && (y > 32 || y < 3)) sz.draw(ctx, 0);
        else water.draw(ctx, 0);
        ctx.translate(32, -24);
        const tile = map[y][x];
        if (tile >= 21 && tile <= 23) this.flags.push({ x, y, points: tile - 21, ...flags.shift() });
        else if (tile) tiles.push({ x, y, tile });
        i++;
      }
      ctx.translate(32 - this.mapWidth * 32, 24 + 24 * this.mapWidth);
    }
    ctx.restore();

    const wind = new Sprite('wind', 64, 48, [[192, 0], [0, 0], [64, 0], [128, 0]]);
    const whirl = new Sprite('whirl', 64, 48, [[64, 0], [128, 0], [192, 0], [0, 0]]);
    const rocks = new JsonSprite(BigRockData);
    const smallRocks = new JsonSprite(SmallRockData);
    await Promise.all([wind.prom, whirl.prom, rocks.prom, smallRocks.prom]);

    tiles.sort((a, b) => {
      if (a.tile >= 20 && b.tile < 20) return 1;
      if (b.tile >= 20 && a.tile < 20) return -1;
      if (a.y < b.y) return -1;
      return b.x - a.x;
    });
    for (const t of tiles) {
      const tile = t.tile;
      const x = (t.x + t.y) * 32;
      const y = (-t.x + t.y) * 24;
      if (tile === 51) smallRocks.draw(ctx, Math.floor(Math.random() * 4), x, y);
      else if (tile === 50) rocks.draw(ctx, Math.floor(Math.random() * 4), x, y);
      else if (tile > 8) whirl.draw(ctx, (tile - 1) % 4, x, y);
      else if (tile > 4) wind.draw(ctx, (tile - 1) % 4, x, y);
    }

    this.drawFlags();
  }

  scroll(e: WheelEvent) {
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

  private saveScale() {
    clearTimeout(this.wheelDebounce);
    this.wheelDebounce = window.setTimeout(() => {
      this.ss.save({ id: 2, value: this._mapScaleRaw, name: 'mapScale', group: 'graphics' });
    }, 1000);
  }

}
