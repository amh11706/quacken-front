import { Component } from '@angular/core';
import { HudComponent } from '../../quacken/hud/hud.component';

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
  }
}
