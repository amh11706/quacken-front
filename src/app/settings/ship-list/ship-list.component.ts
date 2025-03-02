import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { getShipLink } from '../setting/setting.component';
import { BoatTypes } from '../../lobby/quacken/boats/boat-types';

// eslint-disable-next-line no-sparse-arrays
export const BoatTitles = [, , , , , , , , , , , , , ,
  'Sloop', 'Cutter', 'Dhow', 'Fanchuan', 'Longship', 'Baghlah', 'Merchant Brig', 'Junk',
  'War Brig', 'Merchant Galleon', 'Xebec', 'War Galleon', 'War Frigate', 'Grand Frigate', 'Black Ship',
];

export const ShipTypes: { id: BoatTypes; name: string; title: string; cost: number; }[] = [
  { id: 27, name: BoatTitles[27]!, title: 'GF', cost: 60 },
  { id: 26, name: BoatTitles[26]!, title: 'WF', cost: 40 },
  { id: 25, name: BoatTitles[25]!, title: 'WG', cost: 30 },
  { id: 24, name: BoatTitles[24]!, title: 'Xb', cost: 30 },
  { id: 23, name: BoatTitles[23]!, title: 'MG', cost: 20 },
  { id: 22, name: BoatTitles[22]!, title: 'WB', cost: 25 },
  { id: 21, name: BoatTitles[21]!, title: 'Jk', cost: 15 },
  { id: 20, name: BoatTitles[20]!, title: 'MB', cost: 15 },
  { id: 19, name: BoatTitles[19]!, title: 'Bg', cost: 15 },
  { id: 18, name: BoatTitles[18]!, title: 'LS', cost: 10 },
  { id: 17, name: BoatTitles[17]!, title: 'Fc', cost: 7 },
  { id: 16, name: BoatTitles[16]!, title: 'Dh', cost: 7 },
  { id: 15, name: BoatTitles[15]!, title: 'Ct', cost: 7 },
  { id: 14, name: BoatTitles[14]!, title: 'Sl', cost: 5 },
];

export const ShipTypeMap = new Map(ShipTypes.map(s => [s.id, s]));

@Component({
    selector: 'q-ship-list',
    templateUrl: './ship-list.component.html',
    styleUrls: ['./ship-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ShipListComponent implements OnChanges {
  @Input() ships: BoatTypes[] = [];
  @Input() budget = 0;
  @Input() showList = true;
  @Output() shipsChange = new EventEmitter<BoatTypes[]>();
  @Output() shipAdd = new EventEmitter<BoatTypes>();

  getShipLink = getShipLink;
  ShipTypes = ShipTypes;
  ShipTypeMap = ShipTypeMap;
  cost = 0;

  ngOnChanges() {
    this.updateCost();
  }

  shipLabel(id: number): string {
    const t = this.ShipTypeMap.get(id);
    return t ? `${t.title} (${t.cost})` : '';
  }

  static getCost(ships: number[]): number {
    return ships.reduce((sum, id) => sum + (ShipTypeMap.get(id)?.cost ?? 0), 0);
  }

  private updateCost(): void {
    this.cost = ShipListComponent.getCost(this.ships);
    if (this.budget > 0 && this.budget < 1010 && this.cost > this.budget) {
      this.ships.pop();
      this.updateCost();
      return;
    }
    this.shipsChange.emit(this.ships);
  }

  addShip(id: BoatTypes): void {
    this.ships.push(id);
    this.updateCost();
    this.shipAdd.emit(id);
  }

  removeShip(i: number): void {
    this.ships.splice(i, 1);
    this.updateCost();
  }
}
