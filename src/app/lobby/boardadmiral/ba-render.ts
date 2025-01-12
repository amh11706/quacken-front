import { Subject } from "rxjs";
import { Boat } from "../quacken/boats/boat";
import { WsService } from "../../ws/ws.service";
import { OutCmd } from "../../ws/ws-messages";

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
}

const Colors: Record<BoatCoverMode, string> = {
  [BoatCoverMode.Flags]: 'rgba(255, 255, 0, %d)',
  [BoatCoverMode.Tiles]: 'rgba(255, 0, 255, %d)',
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

  drawBoats(boats: Map<number, BABoatSettings>, activeBoat?: BABoatSettings): void {
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

    if (boat.selectedTile) {
      ctx.strokeStyle = 'rgb(0, 255, 255)';
      ctx.strokeRect(boat.selectedTile.x * 50, boat.selectedTile.y * 50, 50, 50);
    }
    this.sendCanvas();
  }

  private sendCanvas(): void {
    this.canvasChange$.next(this.ctx.canvas);
  }
}