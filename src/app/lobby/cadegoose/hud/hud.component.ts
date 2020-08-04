import { Component } from '@angular/core';
import { HudComponent, BoatTick } from '../../quacken/hud/hud.component';

@Component({
  selector: 'q-cade-hud',
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.scss']
})
export class CadeHudComponent extends HudComponent {
  kbControls = 0;
  secondsPerTurn = 30;
  shots = [0, 0, 0, 0, 0, 0, 0, 0];
  moves = [0, 0, 0, 0];
  haveMoves = [2, 4, 2];
  usingMoves = [0, 0, 0];
  tokenStrings = ['', '', ''];
  lastTick: BoatTick = {} as BoatTick;

  wantMove = 2;
  auto = true;

  ngOnInit() {
    super.ngOnInit();
    this.ws.send('boatTick');
    this.subs.add(this.ws.subscribe('boatTick', (t: BoatTick) => {
      this.lastTick = t;
      const hadMoves = this.haveMoves;
      this.haveMoves = [0, 0, 0];
      for (let i = 0; i < t.tokens.length; i++) {
        this.tokenStrings[i] = t.tokens[i].join(', ');
        for (const count of t.tokens[i]) this.haveMoves[i] += count;
      }


      if (this.auto && (this.haveMoves[0] !== hadMoves[0] || this.haveMoves[1] !== hadMoves[1] || this.haveMoves[2] !== hadMoves[2])) {
        this.setAutoWant();
      }
    }));
  }

  changeWantMove() {
    if (this.auto) this.setAutoWant();
    else this.ws.send('wantMove', this.wantMove);
  }

  private setAutoWant() {
    let min = 255;
    for (const move of [1, 0, 2]) {
      if (this.haveMoves[move] < min) {
        min = this.haveMoves[move];
        this.wantMove = move + 1;
      }
    }
    this.ws.send('wantMove', this.wantMove);
  }

  checkMaxMoves() {
    this.usingMoves = [0, 0, 0];
    if (!this.locked) for (let i = 0; i < this.moves.length; i++) {
      const move = this.moves[i];
      if (move === 0) continue;
      if (this.haveMoves[move - 1] > this.usingMoves[move - 1]) this.usingMoves[move - 1]++;
      else this.moves[i] = 0;
    }
    super.checkMaxMoves();
  }

  addShot(i: number) {
    this.shots[i] = (this.shots[i] + 1) % 3;
    this.ws.send('b', this.shots);
  }

  protected getMoves(): number[] {
    return this.moves;
  }

  protected resetMoves() {
    for (const i in this.shots) this.shots[i] = 0;
    super.resetMoves();
    for (let i = 0; i < this.usingMoves.length; i++) this.haveMoves[i] -= this.usingMoves[i];
    this.usingMoves = [0, 0, 0];
  }
}
