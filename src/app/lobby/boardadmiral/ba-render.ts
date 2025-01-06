import { Subject } from "rxjs";
import { Boat } from "../quacken/boats/boat";

export const enum BoatCoverMode {
  Flags,
  Tiles,
}

export class BABoatSettings {
  constructor(public boat: Boat) { }
  coverMode = BoatCoverMode.Flags;
  coverage: Record<BoatCoverMode, { x: number, y: number, a?: number }[]> = {
    [BoatCoverMode.Flags]: [],
    [BoatCoverMode.Tiles]: [],
  };
  Aggro = 50;
  Flag = 50;
  Defense = 50;
}

const Colors: Record<BoatCoverMode, string> = {
  [BoatCoverMode.Flags]: 'rgba(255, 0, 255, %d)',
  [BoatCoverMode.Tiles]: 'rgba(0, 255, 255, %d)',
}

export class BaRender {
  private ctx: CanvasRenderingContext2D;
  canvasChange$ = new Subject<HTMLCanvasElement>();

  constructor(
    width = 20,
    height = 36,
  ) {
    this.ctx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    this.ctx.canvas.height = 50 * height;
    this.ctx.canvas.width = 50 * width;
  }

  drawBoats(boats: Map<number, BABoatSettings>, activeBoat: BABoatSettings): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    boats.forEach(boat => {
      if (boat === activeBoat) return;
      this.drawBoat(boat, 0.2);
    });

    this.drawBoat(activeBoat);
  }

  private drawBoat(boat?: BABoatSettings, alpha = 0.5): void {
    const ctx = this.ctx;
    if (!boat) return;
    const coverage = boat.coverage[boat.coverMode];
    const color = Colors[boat.coverMode];

    for (const { x, y, a } of coverage) {
      ctx.fillStyle = color.replace('%d', String(a || alpha));
      ctx.fillRect(x * 50, y * 50, 50, 50);
    }
    this.sendCanvas();
  }

  private sendCanvas(): void {
    this.canvasChange$.next(this.ctx.canvas);
  }
}