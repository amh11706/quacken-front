import { BoatRender } from '../../cadegoose/boat-render';

export class Boat {
  treasure = 0;
  damage = 0;
  pos = { x: 10, y: 10 };
  moves = [0, 0, 0, 0];
  shots?: number[];
  id = 0;
  oId?: number;
  team?: number;
  title: string = '';
  renderName: string;
  maxDamage = 3;
  maxMoves = 4;
  influence = 1;
  maxShots?: number;
  inSZ = false;

  bomb = 0;
  tokenPoints = 0;
  moveTransition = [0, 0];
  tryFace = 0;
  face = 0;
  rotateTransition = 0;
  opacity = 1;
  imageOpacity = 1;
  enteringSZ = false;
  ready = false;
  offsetX = 0;
  offsetY = 0;
  moveLock = 0;
  spinDeg = 90;
  render?: BoatRender;
  crunchDir = -1;

  constructor(
    public name: string,
    public type = 0,
    public isMe = false,
  ) {
    this.renderName = this.name;
  }

  draw(offsetX: number = 0, offsetY: number = 0) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    return this;
  }

  setPos(x: number, y: number, checkSZ: boolean = true) {
    if (checkSZ && this.checkSZ({ x, y }) && !this.checkSZ(this.pos)) this.enterSZ();
    this.pos = { x, y };
    return this;
  }

  rotateByMove(m: number) {
    if (m) this.face += (m - 2) * this.spinDeg;
    return this;
  }

  setTransition(transition: number, move: number) {
    this.tryFace = transition;
    if (move === 2) this.moveTransition = [1, 1];
    else if (transition % 2) this.moveTransition = [2, 3];
    else this.moveTransition = [3, 2];

    return this;
  }

  getTreasure(): number {
    return this.treasure;
  }

  setTreasure(treasure: number) {
    this.treasure = treasure;
    return this;
  }

  getDamage(): number {
    return Math.round(this.damage * 100 / this.maxDamage);
  }

  addDamage(crunchDir: number, damage: number = 1) {
    this.crunchDir = crunchDir;
    if (damage >= 100) {
      this.damage = this.maxDamage;
      this.sink();
    }
    setTimeout(() => this.crunch(crunchDir), 100);
    return this;
  }

  private crunch(direction: number) {
    if (direction > 3) return;
    const decodeX = this.spinDeg === 90 ? [0, 5, 0, -5] : [0, 4, 4, 0, -4, -4];
    const decodeY = this.spinDeg === 90 ? [-5, 0, 5, 0] : [-5, -2, 2, 5, 2, -2];
    this.moveTransition = [4, 4];
    this.draw(decodeX[direction], decodeY[direction]);
    setTimeout(() => this.draw(), 110);
  }

  private sink() {
    this.rotateTransition = 2;
    this.face += 720;
    this.imageOpacity = 0;
    this.moveLock = 1;
  }

  checkSZ = (pos: { x: number, y: number }) => {
    return pos.y > 48 && pos.y < 52 && pos.x >= 0 && pos.x < 25;
  }

  private enterSZ() {
    this.enteringSZ = true;
    this.opacity = 0;
    this.imageOpacity = 0;
  }
}
