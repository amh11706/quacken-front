import { Component, Input } from '@angular/core';
import { BoatsComponent, BoatSync } from '../../quacken/boats/boats.component';

@Component({
  selector: 'q-cade-boats',
  templateUrl: './cade-boats.component.html',
  styleUrls: ['./cade-boats.component.scss']
})
export class CadeBoatsComponent extends BoatsComponent {
  boatInfluence = -1;
  @Input() teamInfluence = -1;
  diameters: Record<number, string> = { 14: '300px', 15: '400px' };

  protected setBoats(boats: BoatSync[]) {
    super.setBoats(boats);
    const checkSZ = (pos: { x: number, y: number }) => {
      return pos.y > 32 || pos.y < 3;
    };

    for (const boat of this.boats) boat.checkSZ = checkSZ;
  }

}
