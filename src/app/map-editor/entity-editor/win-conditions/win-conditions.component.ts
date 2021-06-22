import { Component, Input, OnChanges } from '@angular/core';
import { DBTile } from '../../map-editor.component';

@Component({
  selector: 'q-win-conditions',
  templateUrl: './win-conditions.component.html',
  styleUrls: ['./win-conditions.component.scss'],
})
export class WinConditionsComponent implements OnChanges {
  @Input() tile?: DBTile;
  winConditions: { id: number, value: number, type: number }[] = [];
  conditions = [
    { name: 'Kills', id: 0 },
    { name: 'Shots Hit', id: 3 },
    { name: 'Shots Fired', id: 4 },
    { name: 'Shots Taken', id: 5 },
    { name: 'Flag Points', id: 7 },
    { name: 'Turns Taken', id: 99 },
    { name: 'Cuttle Cake', id: 100 },
    { name: 'Taco Locker', id: 101 },
    { name: 'Pea Pod', id: 102 },
    { name: 'Fried Egg', id: 103 },
    { name: 'Bomb Duck', id: 104 },
    { name: 'Bomb Head', id: 105 },
  ];

  types = ['>', '<', '='];

  constructor() { }

  ngOnChanges(): void {
    if (!this.tile?.settings) return;
    this.winConditions = this.tile.settings.winConditions || [];
    this.tile.settings.winConditions = this.winConditions;
  }

  addCondition() {
    this.winConditions.push({ id: this.conditions[0].id, value: 0, type: 0 });
    if (this.tile) this.tile.unsaved = true;
  }

  removeCondition(i: number) {
    if (this.winConditions.length === 1) this.winConditions = [];
    else this.winConditions = this.winConditions.splice(i - 1, 1);
    if (this.tile) this.tile.unsaved = true;
  }
}
