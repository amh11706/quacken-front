import { Internal } from '../../ws/ws-messages';
import { WsService } from '../../ws/ws.service';
import { AiBoatData, Points } from './types';

const Colors = {
  Shoot: 'rgba(0, 255, 0, %d)',
  GetShot: 'rgba(255, 0, 0, %d)',
  BoatAt: 'rgba(255, 127, 127, %d)',
  Total: 'rgba(0, 255, 255, %d)',
  Flags: 'rgba(255, 0, 255, %d)',
  Claims: 'rgba(255, 255, 0, %d)',
  EndBonus: 'rgba(0, 0, 255, %d)',
};

export class AiRender {
  private boat?: AiBoatData;
  private metric: keyof Points = 'BoatAt';
  private step = 0;
  private radius = 4;

  private ctx: CanvasRenderingContext2D;

  constructor(private ws: WsService, width: number, height: number) {
    this.ctx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
    this.ctx.canvas.height = 50 * height;
    this.ctx.canvas.width = 50 * width;
  }

  setBoat(boat?: AiBoatData): void {
    this.boat = boat;
    this.updateRender();
  }

  setClaims(claims: { x: number, y: number, size: number }[]): void {
    // TODO: use the canvas to draw the claims

    // BoatService.dispose(this.claims);
    // this.claims.remove(...this.claims.children);
    // this.object.add(this.claims);
    // if (!claims.length) return;

    // for (const c of claims) {
    //   const claimGeo = new PlaneBufferGeometry(c.size, c.size);
    //   claimGeo.rotateX(-Math.PI / 2);
    //   const claimObj = new Mesh(claimGeo);
    //   claimObj.position.x = c.x + c.size / 2;
    //   claimObj.position.z = c.y + c.size / 2;
    //   const box = new BoxHelper(claimObj, c.x === this.boat?.claim?.x && c.y === this.boat?.claim?.y ? 'cyan' : 'blue');
    //   box.renderOrder = 2;
    //   this.claims.add(box);
    // }
  }

  setMetric(metric: keyof Points): void {
    this.metric = metric;
    this.updateRender();
  }

  setStep(step: number): void {
    this.step = step;
    this.updateRender();
  }

  setRadius(radius: number): void {
    this.radius = radius;
    this.updateRender();
  }

  private findRange(): { min: number, max: number } {
    const range = { min: 0, max: 1 };
    if (!this.boat) return range;
    for (const coordString in this.boat.pm) {
      if (!this.boat.pm.hasOwnProperty(coordString)) continue;
      const points = this.boat.pm[coordString];
      const index = this.metric === 'Flags' || this.metric === 'Claims' ? this.radius : this.step;
      const value = (this.metric === 'EndBonus' ? points?.[this.metric] : points?.[this.metric][index]) || 0;

      if (Array.isArray(value)) range.max = Math.max(range.max, ...value);
      else {
        if (value > range.max) range.max = value;
        if (value < range.min) range.min = value - 1;
      }
    }
    range.max = range.max * 1.33 - range.min;
    return range;
  }

  private drawShots(x: number, y: number, shots: number[], max: number) {
    const ctx = this.ctx;
    ctx.translate(x + 25, y + 25);
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      if (!shot) {
        ctx.rotate(Math.PI / 2);
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(25, 25);
      ctx.lineTo(-25, 25);
      ctx.closePath();
      ctx.fillStyle = Colors[this.metric].replace('%d', String((shot + 10) / max));
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.strokeText(String(shot), 0, 15);
      ctx.fillStyle = 'white';
      ctx.fillText(String(shot), 0, 15);
      ctx.rotate(Math.PI / 2);
    }
    ctx.resetTransform();
  }

  private updateRender() {
    const ctx = this.ctx;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!this.boat) return;
    const { min, max } = this.findRange();

    for (const coordString in this.boat.pm) {
      if (!this.boat.pm.hasOwnProperty(coordString)) continue;
      const coords = coordString.split(',');
      const x = +(coords[0] || 0) * 50;
      const y = +(coords[1] || 0) * 50;
      const points = this.boat.pm[coordString];
      const index = this.metric === 'Flags' || this.metric === 'Claims' ? this.radius : this.step;
      const value = this.metric === 'EndBonus' ? points?.[this.metric] : points?.[this.metric][index];
      if (!value) continue;
      if (Array.isArray(value)) {
        this.drawShots(x, y, value, max);
        continue;
      }

      ctx.fillStyle = Colors[this.metric].replace('%d', String((value - min + max / 8) / max));
      ctx.fillRect(x, y, 50, 50);
      ctx.fillStyle = 'black';
      ctx.strokeText(String(value), x + 25, y + 40);
      ctx.fillStyle = 'white';
      ctx.fillText(String(value), x + 25, y + 40);
    }

    (this.ws.fakeWs || this.ws).dispatchMessage({ cmd: Internal.Canvas, data: ctx.canvas });
  }
}
