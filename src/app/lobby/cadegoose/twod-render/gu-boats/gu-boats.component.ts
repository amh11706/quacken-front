import { Component, Input } from '@angular/core';
import { BoatService } from '../../boat.service';
import { GuBoat } from './gu-boat';
import { WsService } from 'src/app/ws.service';
import { Boat } from 'src/app/lobby/quacken/boats/boat';

@Component({
  selector: 'q-gu-boats',
  templateUrl: './gu-boats.component.html',
  styleUrls: ['./gu-boats.component.scss'],
})
export class GuBoatsComponent extends BoatService {
  @Input() getX = (p: { x: number, y: number }): number => (p.x + p.y) * 32;
  @Input() getY = (p: { x: number, y: number }): number => (p.y - p.x + 19) * 24;
  moveTransition = (transition: number): string => {
    switch (transition) {
      case 0: return '0s linear';
      case 1: return 10 / this.speed + 's linear';
      case 2:
      case 3:
      case 4: return 6 / this.speed + 's linear';
      default: return '';
    }
  }

  constructor(ws: WsService) {
    super(ws);
    this.blockRender = false;
  }

  render(boat: Boat): GuBoat {
    return (boat.render || { orientation: {} }) as GuBoat;
  }

  protected checkNewShips() {
    for (const boat of this.boats) {
      if (boat.render) continue;
      let newBoat = this._boats[boat.id];
      if (newBoat.render && boat.render !== newBoat.render) newBoat = this._boats[-boat.id];
      if (!newBoat || newBoat.render) continue;
      boat.render = new GuBoat(boat, undefined as any);
    }
    return [];
  }
}
