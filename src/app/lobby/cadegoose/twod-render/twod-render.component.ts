import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Boat } from '../../quacken/boats/boat';
import { Subscription } from 'rxjs';
import { SettingsService } from 'src/app/settings/settings.service';
import { Sprite, JsonSprite, getTileImage } from './sprite';
import { BigRockData } from './objects/big_rock';
import { SmallRockData } from './objects/small_rock';

@Component({
  selector: 'q-twod-render',
  templateUrl: './twod-render.component.html',
  styleUrls: ['./twod-render.component.scss']
})
export class TwodRenderComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvasElement?: ElementRef<HTMLCanvasElement>;
  @ViewChild('flagCanvas', { static: true }) flagCanvasElement?: ElementRef<HTMLCanvasElement>;
  @Input() hoveredTeam = -1;
  @Input() mapHeight = 36;
  @Input() mapWidth = 20;
  @Input() myBoat = new Boat('');
  @Input() speed = 10;
  private _mapScale = 1;
  private _mapScaleRaw = 50;
  @Input() set mapScale(v: number) {
    this._mapScale = +v / 50;
    this._mapScaleRaw = +v;
  }
  get mapScale() { return this._mapScale; }

  private wheelDebounce?: number;
  private sub = new Subscription();
  private canvas?: CanvasRenderingContext2D | null;
  private flagCanvas?: CanvasRenderingContext2D | null;

  getX = (p: { x: number, y: number }): number => (p.x + p.y) * 32;
  getY = (p: { x: number, y: number }): number => (p.y - p.x + this.mapWidth - 1) * 24;
  getXOff = (p: { x: number, y: number }): number => (1 + p.x + p.y - (this.mapWidth + this.mapHeight) / 2) * 32;
  getYOff = (p: { x: number, y: number }): number => (p.y - p.x - (this.mapHeight - this.mapWidth) / 2) * 24;

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
  ) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getHeight() {
    return (this.mapWidth + this.mapHeight) * 24;
  }

  getWidth() {
    return (this.mapWidth + this.mapHeight) * 32;
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
      ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
    } else {
      ctx.translate(0, this.mapWidth * 24 - 24);
      this.flagCanvas.translate(0, this.mapWidth * 24 - 24);
    }
    getTileImage('alkaid_island').then(img => ctx.drawImage(img, -150, -650));

    const tiles: { x: number, y: number, tile: number }[] = [];
    ctx.save();
    let i = 0;
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        if (y > 32 || y < 3) sz.draw(ctx, 0);
        else water.draw(ctx, 0);
        ctx.translate(32, -24);
        const tile = map[y][x];
        if (tile) tiles.push({ x, y, tile });
        i++;
      }
      ctx.translate(32 - this.mapWidth * 32, 24 + 24 * this.mapWidth);
    }
    ctx.restore();

    const wind = new Sprite('wind', 64, 48, [[192, 0], [0, 0], [64, 0], [128, 0]]);
    const whirl = new Sprite('whirl', 64, 48, [[64, 0], [128, 0], [192, 0], [0, 0]]);
    const flag = new Sprite('buoy', 50, 69, [[250, 0], [250, 69], [250, 138]]);
    const rocks = new JsonSprite(BigRockData);
    const smallRocks = new JsonSprite(SmallRockData);
    await Promise.all([wind.prom, whirl.prom, flag.prom, rocks.prom, smallRocks.prom]);

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
      else if (tile > 20) {
        flag.draw(this.flagCanvas, tile - 21, x + 7, y - 33);

      } else if (tile > 8) whirl.draw(ctx, (tile - 1) % 4, x, y);
      else if (tile > 4) wind.draw(ctx, (tile - 1) % 4, x, y);
    }
  }

  scroll(e: WheelEvent) {
    if (!e.ctrlKey) return;
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
