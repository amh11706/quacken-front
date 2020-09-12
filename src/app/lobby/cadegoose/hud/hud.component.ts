import { Component } from '@angular/core';
import { HudComponent, BoatTick } from '../../quacken/hud/hud.component';

@Component({
  selector: 'q-cade-hud',
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.scss']
})
export class CadeHudComponent extends HudComponent {
  kbControls = 0;
  protected secondsPerTurn = 30;
  protected maxTurn = 75;
  shots = [0, 0, 0, 0, 0, 0, 0, 0];
  moves = [0, 0, 0, 0];
  haveMoves = [2, 4, 2];
  usingMoves = [0, 0, 0];
  tokenStrings = ['', '', ''];
  lastTick: BoatTick = {} as BoatTick;
  usingCannons = 0;
  newTurn = false;

  wantMove = 2;
  auto = true;

  ngOnInit() {
    super.ngOnInit();
    this.subs.add(this.ws.subscribe('_myBoat', () => {
      this.shots = [0, 0, 0, 0, 0, 0, 0, 0];
    }));
    this.subs.add(this.ws.subscribe('turn', () => {
      this.newTurn = true;
    }));
    this.subs.add(this.ws.subscribe('boatTick', (t: BoatTick) => {
      if (this.newTurn) {
        this.usingCannons = 0;
        this.newTurn = false;
      }
      this.lastTick = t;
      const hadMoves = this.haveMoves;
      this.haveMoves = [0, 0, 0];
      if (t.t) for (let i = 0; i < t.t.length; i++) {
        this.tokenStrings[i] = t.t[i].join(', ');
        for (const count of t.t[i]) this.haveMoves[i] += count;
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

  sendReady() {
    this.ws.send('r');
  }

  imReady() {
    if (this.myBoat.ready) return;
    this.stopTimer();
    this.myBoat.ready = true;
    this.locked = true;
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
    const oldShots = this.shots[i];
    this.shots[i] = (oldShots + 1) % (this.myBoat.doubleShot ? 3 : 2);
    this.usingCannons += this.shots[i] - oldShots;
    if (this.usingCannons > this.lastTick.tp) {
      this.usingCannons -= this.shots[i];
      this.shots[i] = 0;
    }
    this.ws.send('b', this.shots);
  }

  protected getMoves(): number[] {
    return this.moves;
  }

  protected resetMoves() {
    super.resetMoves();
    for (let i = 0; i < this.usingMoves.length; i++) this.haveMoves[i] -= this.usingMoves[i];
    this.usingMoves = [0, 0, 0];
    this.shots = [0, 0, 0, 0, 0, 0, 0, 0];
    this.usingCannons = 0;
  }
}
