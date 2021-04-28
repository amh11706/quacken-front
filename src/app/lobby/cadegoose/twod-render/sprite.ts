export function getTileImage(tile: string): Promise<HTMLImageElement> {
  const p = document.createElement('img');
  p.src = `/assets/images/${tile}.png`;
  const tilePromise = new Promise<HTMLImageElement>(resolve => {
    p.onload = () => resolve(p);
    p.onerror = () => resolve(p);
  });
  return tilePromise;
}

export class Sprite {
  private img?: HTMLImageElement;
  prom: Promise<any>;

  constructor(
    private name: string,
    private width: number,
    private height: number,
    private positions: [number, number][]
  ) {
    this.prom = getTileImage(name).then(img => this.img = img);
  }

  draw(ctx: CanvasRenderingContext2D, index: number, x = 0, y = 0) {
    if (!this.img) throw new Error(this.name + ' image not loaded.');
    const pos = this.positions[index];
    ctx.drawImage(
      this.img,
      pos[0], pos[1],
      this.width, this.height,
      x, y,
      this.width, this.height
    );
  }
}

export interface SpriteData {
  name: string;
  orientations: { [key: string]: Orientation };
}

export interface Orientation {
  x: number;
  y: number;
  width: number;
  height: number;
  offsetx: number;
  offsety: number;
}

export class JsonSprite {
  private img?: HTMLImageElement;
  prom: Promise<any>;

  constructor(private data: SpriteData) {
    this.prom = getTileImage(data.name).then(img => this.img = img);
  }

  draw(ctx: CanvasRenderingContext2D, index: number, x = 0, y = 0) {
    if (!this.img) throw new Error(this.data.name + ' image not loaded.');
    const values = this.data.orientations[index];
    ctx.drawImage(
      this.img,
      values.x, values.y,
      values.width, values.height,
      x + 2 - values.offsetx, y - values.offsety,
      values.width, values.height
    );
  }
}
