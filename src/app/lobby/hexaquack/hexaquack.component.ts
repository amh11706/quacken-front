import { Component } from '@angular/core';
import { QuackenComponent } from '../quacken/quacken.component';
import { Boat } from '../quacken/boats/boat';

@Component({
  selector: 'q-hexaquack',
  templateUrl: './hexaquack.component.html',
  styleUrls: ['./hexaquack.component.css']
})
export class HexaquackComponent extends QuackenComponent {
  moveTransition = (transition: number): string => {
    switch (transition) {
      case 0: return '0s linear';
      case 4: return '.1s linear';
      default:
        const time = 1 / this.settings.speed;
        return `${time * 10}s linear ${time * 3}s`;
    }
  }
  rotateTransition = (b: Boat): string => {
    if (b.rotateTransition === 1) {
      return 6 / this.settings.speed + 's linear';
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
