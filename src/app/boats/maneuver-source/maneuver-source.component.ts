import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tokens } from '../move-input/move-input.component';

@Component({
  selector: 'q-maneuver-source',
  templateUrl: './maneuver-source.component.html',
  styleUrls: ['./maneuver-source.component.scss'],
})
export class ManeuverSourceComponent {
  @Input() dragContext = { source: 8, move: 0 };
  @Input() maneuvers = [
    { id: 4, class: 'move bombtoken', title: 'Chain Shot' },
    { id: 8, class: 'move', title: 'In-place Turn' },
    { id: 12, class: 'move', title: 'Double Forward' },
    { id: 16, class: 'move', title: 'Flotsam' },
  ];

  @Input() unusedTokens: Tokens = {
    moves: [0, 0, 0],
    shots: 0,
    maneuvers: [0, 0, 0, 0],
  };

  wantManeuver = 0;
  @Output() wantManeuverChange = new EventEmitter<number>();

  setWantToken(i: number): void {
    this.wantManeuver = i;
    this.wantManeuverChange.emit(i);
  }

  dragManeuver(token: number): void {
    this.dragContext.move = token;
    this.dragContext.source = 8;
  }
}
