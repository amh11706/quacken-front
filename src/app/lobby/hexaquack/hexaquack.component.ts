import { Component } from '@angular/core';
import { QuackenComponent } from '../quacken/quacken.component';

@Component({
  selector: 'app-hexaquack',
  templateUrl: './hexaquack.component.html',
  styleUrls: ['./hexaquack.component.css']
})
export class HexaquackComponent extends QuackenComponent {
  moveTransitions = [
    '0s linear',
    's linear .3s',
    's linear .3s',
    's linear .3s',
    '.1s linear'  // crunch
  ];
  rotateTransitions = [
    '0s linear',
    '.3s ease', // normal rotate
    '3s linear', // sink rotate
    '1s ease', // duck poo
    '.2s ease' // defenduck spin
  ];

  getX(p: { x: number, y: number }): number {
    return p.x * 45 - 3;
  }

  getY(p: { x: number, y: number }): number {
    const offset = p.x % 2 ? 0 : -26;
    return p.y * 52 + offset;
  }
}
