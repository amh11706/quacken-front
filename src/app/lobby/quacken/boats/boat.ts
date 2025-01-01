import { Team } from './types';

export class Boat {
  treasure = 0;
  damage = 0;
  bilge = 0;
  pos = { x: 10, y: 10 };
  moves = [0, 0, 0, 0];
  shots: number[] = [];
  id = 0;
  team?: Team;
  title = '';
  maxDamage = 3;
  maxMoves = 4;
  influence = 1;
  maxShots = 1;
  inSZ = false;

  bomb = 0;
  tokenPoints = 0;
  face = 0;
  crunchDir = 0;
  moveTransition = [0, 0];
  rotateTransition = 0;
  ready = false;
  moveLock = 0;
  maneuvers: { id: number, name: string, class: string, directional?: boolean }[] = [];

  constructor(
    public name: string,
    public type = 0,
    public isMe = false,
  ) { }

  resetMoves(): Boat {
    this.moves = [0, 0, 0, 0];
    this.shots = [0, 0, 0, 0, 0, 0, 0, 0];
    this.bomb = 0;
    this.ready = false;
    return this;
  }

  setPos(x: number, y: number): Boat {
    this.pos = { x, y };
    return this;
  }

  rotateByMove(m: number): Boat {
    if (m && m < 6) this.face += (m - 2) * 90;
    return this;
  }

  setTransition(transition: number, move: number): Boat {
    if (move === 2) this.moveTransition = [1, 1];
    else if (transition % 2) this.moveTransition = [2, 3];
    else this.moveTransition = [3, 2];

    return this;
  }

  getTreasure(): number {
    return this.treasure;
  }

  setTreasure(treasure: number): Boat {
    this.treasure = treasure;
    return this;
  }

  getDamage(): number {
    return Math.round(this.damage * 100 / this.maxDamage);
  }

  addDamage(crunchDir: number, damage = 1): Boat {
    this.crunchDir = crunchDir;
    if (damage >= 100) {
      this.sink();
    }
    setTimeout(() => this.crunch(crunchDir), 100);
    return this;
  }

  private crunch(direction: number) {
    if (direction > 3) return;
    this.moveTransition = [4, 4];
    this.crunchDir = direction;
  }

  private sink() {
    this.rotateTransition = 2;
    this.moveLock = 101;
  }

  checkSZ = (pos: { x: number, y: number }): boolean => {
    return pos.y > 48 && pos.y < 52 && pos.x >= 0 && pos.x < 25;
  };
}
