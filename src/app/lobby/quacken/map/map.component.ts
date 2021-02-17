import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../../settings/settings.service';
import { Boat } from '../boats/boat';

export const RotatedTiles = [1, 2, 3, 50, 51];

@Component({
  selector: 'q-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasElement?: ElementRef<HTMLCanvasElement>;
  @Input() myBoat = new Boat('');
  @Input() speed = 10;
  @Input() set map(b64: string) { if (b64) this.renderMap(atob(b64)); }
  _mapScale = '';
  _mapScaleRaw = 0;
  @Input() set mapScale(v: number | string) {
    this._mapScale = `scale(${Math.round(+v / 5) / 10})`;
    this._mapScaleRaw = +v;
  }
  get mapScale() { return this._mapScale; }

  readonly titles = ['', 'Cuttle Cake', 'Taco Locker', 'Pea Pod', 'Fried Egg'] as const;
  private wheelDebounce?: number;
  private sub = new Subscription();
  private canvas?: CanvasRenderingContext2D | null;
  private tiles = new Map<string, Promise<HTMLImageElement>>();

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

  private getTileImage(tile: string): Promise<HTMLImageElement> {
    let tilePromise = this.tiles.get(tile);
    if (!tilePromise) {
      const p = document.createElement('img');
      p.src = `/assets/images/${tile}.png`;
      tilePromise = new Promise(resolve => {
        p.onload = () => resolve(p);
        p.onerror = () => resolve(p);
      });
      this.tiles.set(tile, tilePromise);
    }
    return tilePromise;
  }

  private async renderMap(bString: string) {
    if (!this.canvas) this.canvas = this.canvasElement?.nativeElement.getContext('2d');
    if (!this.canvas) return;
    const water = await this.getTileImage('water');
    const ctx = this.canvas;
    ctx.strokeStyle = '#4080bf';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#064886';

    let i = 0;
    for (let y = 0; y < 52; y++) {
      for (let x = 0; x < 25; x++) {
        if (y > 48) ctx.fillRect(0, 0, 50, 50);
        else ctx.drawImage(water, 0, 0);
        ctx.strokeRect(0, 0, 50, 50);

        const tile = bString.charCodeAt(i);
        if (tile) {
          const image = await this.getTileImage('obstacle' + tile);
          ctx.save();
          ctx.translate(25, 25);
          if (RotatedTiles.includes(tile)) {
            ctx.rotate(45 * Math.PI / 180);
          }
          ctx.drawImage(image, -25, -25, 50, 50);
          ctx.restore();
        }

        ctx.translate(50, 0);
        i++;
      }
      ctx.translate(-1250, 50);
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
