import { Component, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { SettingsService } from 'src/app/settings/settings.service';
import { WsService } from 'src/app/ws.service';
import { JsonSprite, Sprite } from '../twod-render/sprite';
import { BigRockData } from '../twod-render/objects/big_rock';
import { SmallRockData } from '../twod-render/objects/small_rock';

const FlagColorOffsets: Record<number, number> = {
  0: 0,
  1: 3,
  98: 6,
  99: 9,
  100: 12,
};

@Component({
  selector: 'q-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent {
  @ViewChild('canvas', { static: true }) canvasElement?: ElementRef<HTMLCanvasElement>;
  @ViewChild('flagCanvas', { static: true }) flagCanvasElement?: ElementRef<HTMLCanvasElement>;
  @ViewChild('frame') frame?: ElementRef<HTMLElement>;
  @Input() mapHeight = 36;
  @Input() mapWidth = 20;
  @Input() safeZone = true;
  @Input() set map(map: number[][]) { this.fillMap(map, []); }

  private canvas?: CanvasRenderingContext2D | null;
  private flags: { x: number, y: number, t: number, points: number, cs: number[] }[] = [];
  private flag = new Sprite('buoy', 50, 69, [
    [50, 0], [50, 69], [50, 138],
    [100, 0], [100, 69], [100, 138],
    [0, 0], [0, 69], [0, 138],
    [250, 0], [250, 69], [250, 138],
    [200, 0], [200, 69], [200, 138],
  ]);

  getHeight() {
    return (this.mapHeight + this.mapWidth) * 24;
  }

  getWidth() {
    return (this.mapHeight + this.mapWidth) * 32;
  }

  private async drawFlags() {
    if (!this.canvas || this.flags.length === 0) return;
    await this.flag.prom;
    for (const f of this.flags) {
      if (f.t === undefined) f.t = 0;
      const offset = FlagColorOffsets[99];
      const x = (f.x + f.y) * 32;
      const y = (-f.x + f.y) * 24;
      this.flag.draw(this.canvas, f.points + offset, x + 7, y - 33);
    }
  }

  async fillMap(map: number[][], flags: any[]) {
    const wasLoaded = !!this.canvas;
    if (!this.canvas) {
      this.canvas = this.canvasElement?.nativeElement.getContext('2d');
    }
    if (!this.canvas) return;
    const water = new Sprite('cell', 64, 48, [[128, 0]]);
    const sz = new Sprite('safezone', 64, 48, [[128, 0]]);
    await Promise.all([water.prom, sz.prom]);
    const ctx = this.canvas;
    if (wasLoaded) {
    } else {
      ctx.scale(0.2, 0.2);
      ctx.translate(-150, 400);
      // ctx.translate(0, this.mapWidth * 24 - 24);
    }
    ctx.clearRect(0, -(this.mapWidth * 24 - 24), this.getWidth(), this.getHeight());
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

}
