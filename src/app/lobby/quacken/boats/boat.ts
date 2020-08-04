export const BoatDamages = [3, 12, 6, 6, 6, 3, 12, 6, 6, 6, 24, 36, 48, 48, 50, 100];

export class Boat {
  treasure = 0;
  damage = 0;
  pos = { x: 12, y: 49 };
  moves = [0, 0, 0, 0];
  id?: number;
  oId?: number;
  team?: number;

  bomb = 0;
  tokenPoints = 0;
  moveTransition = [0, 0];
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

  constructor(
    public name: string,
    public type = 0,
    public isMe = false,
  ) { }

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
    return this.damage * 96 / BoatDamages[this.type];
  }

  addDamage(crunchDir: number, damage: number = 1) {
    if (damage >= 100) setTimeout(() => this.sink(), 500);
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
  }

  checkSZ = (pos: { x: number, y: number }) => {
    return pos.y > 48 && pos.y < 52 && pos.x >= 0 && pos.x < 25;
  }

  private enterSZ() {
    this.enteringSZ = true;
    this.opacity = 0;
  }
}
