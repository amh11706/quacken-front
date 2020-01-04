import { Component } from '@angular/core';
import { QuackenComponent } from '../quacken/quacken.component';
import { Boat } from '../quacken/boats/boat';

@Component({
  selector: 'app-hexaquack',
  templateUrl: './hexaquack.component.html',
  styleUrls: ['./hexaquack.component.css']
})
export class HexaquackComponent extends QuackenComponent {
  moveTransitions = [
    '0s linear',
    's linear',
    's linear',
    's linear',
    '.1s linear'  // crunch
  ];
  rotateTransition = (b: Boat): string => {
    if (b.rotateTransition === 1) {
      return 10 / this.settings.speed + 's ease-in';
    }
    return [
      '0s linear',
      '', // normal rotate handled above
      '3s linear', // sink rotate
      '1s ease', // duck poo
      '.2s ease' // defenduck spin
    ][b.rotateTransition];
  }

  getX(p: { x: number, y: number }): number {
    return p.x * 45 - 3;
  }

  getY(p: { x: number, y: number }): number {
    const offset = p.x % 2 ? 0 : -26;
    return p.y * 52 + offset;
  }
}
