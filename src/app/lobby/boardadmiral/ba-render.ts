import { Subject } from 'rxjs';
import { Boat } from '../quacken/boats/boat';
import { WsService } from '../../ws/ws.service';
import { OutCmd } from '../../ws/ws-messages';

export const enum BoatCoverMode {
  Flags,
  Tiles,
}

export interface ServerBASettings {
  Id: number;
  Aggro: number;
  Flag: number;
  Defense: number;
  CoverMode: BoatCoverMode;
  Coverage: { x: number, y: number }[];
}

export class BABoatSettings {
  constructor(public boat: Boat, private ws: WsService) { }
  coverMode = BoatCoverMode.Flags;
  coverage: Record<BoatCoverMode, { x: number, y: number, a?: number }[]> = {
    [BoatCoverMode.Flags]: [],
    [BoatCoverMode.Tiles]: [],
  };

  Aggro = 50;
  Flag = 50;
  Defense = 50;
  selectedTile?: { x: number, y: number };

  getCoverage() {
    this.coverage[this.coverMode] ||= [];
    return this.coverage[this.coverMode];
  }

  clearCoverage(): void {
    this.coverage[this.coverMode] = [];
  }

  save(): void {
    this.ws.send(OutCmd.BASettings, this.toJSON());
  }

  toJSON(): ServerBASettings {
    return {
      Id: this.boat.id,
      Aggro: this.Aggro,
      Flag: this.Flag,
      Defense: this.Defense,
      CoverMode: this.coverMode,
      Coverage: this.coverage[this.coverMode].map(({ x, y }) => ({ x, y })),
    };
  }

  fromJSON(data: ServerBASettings): this {
    this.Aggro = data.Aggro;
    this.Flag = data.Flag;
    this.Defense = data.Defense;
    this.coverMode = data.CoverMode;
    this.coverage[data.CoverMode] = data.Coverage;
    return this;
  }

  static circles = [
    [0],
    [0, 1, 0],
    [0, 1, 2, 1, 0],
    [0, 2, 2, 3, 2, 2, 0],
    [0, 2, 3, 3, 4, 3, 3, 2, 0],
    [0, 2, 3, 4, 4, 5, 4, 4, 3, 2, 0],
  ];

  isCoveragePossible(withAdded?: { x: number, y: number }): boolean {
    if (this.coverMode === BoatCoverMode.Tiles) return true;
    const flags = [...this.coverage[BoatCoverMode.Flags]];
    if (withAdded) flags.push(withAdded);
    return this.hasIntersection(flags, this.boat.influence);
  }

  // returns true if there is at least one tile that all of the provided circles contain
  protected hasIntersection(centers: { x: number, y: number }[], radius: number): boolean {
    const circleRows = BABoatSettings.circles[radius];
    if (!circleRows) return false;
    const firstCircle = centers[0];
    if (!firstCircle) return false;

    const yOff = Math.floor(circleRows.length / 2);
    let y = firstCircle.y - yOff;
    for (const xOff of circleRows) {
      for (let x = firstCircle.x - xOff; x <= firstCircle.x + xOff; x++) {
        if (centers.every(c => {
          const dx = c.x - x;
          const dy = c.y - y;
          return dx * dx + dy * dy <= radius * radius;
        })) {
          return true;
        }
      }
      // move to the next row
      y++;
    }
    return false;
  }
}

const Colors: Record<BoatCoverMode, string> = {
  [BoatCoverMode.Flags]: 'rgba(255, 255, 0, %d)',
  [BoatCoverMode.Tiles]: 'rgba(255, 0, 255, %d)',
};

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

  drawBoats(boats: Map<number, BABoatSettings>, activeBoat?: BABoatSettings): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    boats.forEach(boat => {
      if (boat === activeBoat) return;
      this.drawBoat(boat, 0.3, true);
    });

    this.drawBoat(activeBoat);
  }

  private drawBoat(boat?: BABoatSettings, alpha = 0.5, border = false): void {
    const ctx = this.ctx;
    ctx.lineWidth = 4;
    if (!boat) return;
    const coverage = boat.getCoverage();
    const color = Colors[boat.coverMode];
    if (boat.boat.attr) {
      // attr 51 is a flag that the boat has no coverage
      boat.boat.attr[51] = coverage.length ? 0 : 1;
    }

    for (const { x, y, a } of coverage) {
      ctx.fillStyle = color.replace('%d', String(a || alpha));
      if (border) {
        ctx.strokeStyle = ctx.fillStyle;
        ctx.strokeRect(x * 50, y * 50, 50, 50);
      } else {
        ctx.fillRect(x * 50, y * 50, 50, 50);
      }
    }

    if (boat.selectedTile) {
      ctx.strokeStyle = 'rgb(0, 255, 255)';
      ctx.lineWidth = 2;
      ctx.strokeRect(boat.selectedTile.x * 50, boat.selectedTile.y * 50, 50, 50);
    }
    this.sendCanvas();
  }

  private sendCanvas(): void {
    this.canvasChange$.next(this.ctx.canvas);
  }
}
