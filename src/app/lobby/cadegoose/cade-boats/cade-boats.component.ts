import { Component } from '@angular/core';
import { BoatsComponent, BoatSync } from '../../quacken/boats/boats.component';

@Component({
  selector: 'q-cade-boats',
  templateUrl: './cade-boats.component.html',
  styleUrls: ['./cade-boats.component.scss']
})
export class CadeBoatsComponent extends BoatsComponent {
  protected setBoats(boats: BoatSync[]) {
    super.setBoats(boats);
    const checkSZ = (pos: { x: number, y: number }) => {
      return pos.y > 32 || pos.y < 3;
    }

    for (const boat of this.boats) boat.checkSZ = checkSZ;
  }

}
