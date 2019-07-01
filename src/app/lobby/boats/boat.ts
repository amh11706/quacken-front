export const BoatTypes = [3, 12, 6, 6, 6, 3, 12, 6, 6, 6, 24, 36, 48, 48];

export class Boat {
  private treasure = 0;
  private damage = 0;
  pos = [12, 49];

  bomb = 0;
  tokenPoints = 0;
  moveTransition = [0, 0];
  face = 0;
  rotateTransition = 1;
  opacity = 1;
  imageOpacity = 1;
  enteringSZ = false;
  ready = false;
  offsetX = 0;
  offsetY = 0;

  constructor(
    public name: string,
    public isMe: boolean = false,
    public moves: number[] = [0, 0, 0, 0],
    public type: number = 0,
  ) {}

  draw(offsetX: number = 0, offsetY: number = 0) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
		return this;
	}

	setPos(x: number, y: number, checkSZ: boolean = true) {
		if ( checkSZ && this.checkSZ([x, y]) && !this.checkSZ(this.pos) ) this.enterSZ();
		this.pos = [x, y];
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
    return this.damage * 96 / BoatTypes[this.type];
  }

	setDamage(damage: number) {
		this.damage = damage;
		if (this.damage >= BoatTypes[this.type]) {
      this.damage = BoatTypes[this.type];
      setTimeout(() => this.sink(), 500);
    }
  	return this;
	}

	addDamage(crunchDir: number, damage: number = 1) {
		this.setDamage(this.damage + damage);
		setTimeout(() => this.crunch(crunchDir), 100);
		return this;
	}

	private crunch(direction: number) {
    if (direction > 3) return;
		const decodeX = [0, 0.1, 0, -0.1];
    const decodeY = [-0.1, 0, 0.1, 0];
		this.moveTransition = [4, 4];
		this.draw(decodeX[direction], decodeY[direction]);
		setTimeout(() => this.draw(), 110);
	}

	private sink() {
    this.rotateTransition = 2;
		this.face += 720;
    this.imageOpacity = 0;
	}

	private checkSZ(pos: number[]) {
		return pos[1] > 48 && pos[1] < 52 && pos[0] >= 0 && pos[0] < 25;
	}

	private enterSZ() {
		this.enteringSZ = true;
		this.opacity = 0;
	}
}
