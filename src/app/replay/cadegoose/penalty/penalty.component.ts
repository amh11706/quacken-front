import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface PenaltySummary {
  name: string,
  penalties: number[],
  turns: { turn: number, quantity: number }[][],
  total: number,
}

export const Penalties = [
  { title: 'Rock bump', value: 2500 },
  { title: 'Sink', value: 5000 },
  { title: 'Ram sink', value: 5000 },
  { title: 'Down shots to token', value: 2500 },
  { title: 'Used token without going up shots', value: 2500 },
  { title: 'Stuck in flotsam', value: 2500 },
  { title: 'Leak >50% cluster', value: 5000 },
  { title: 'Missed shot chance', value: 1000 },
  { title: 'Special tokens used', value: 0 },
  { title: 'Shots hit', value: 0 },
  { title: 'Points scored', value: 0 },
];

@Component({
  selector: 'q-penalty',
  templateUrl: './penalty.component.html',
  styleUrls: ['./penalty.component.scss'],
})
export class PenaltyComponent {
  Penalties = Penalties;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { rows: PenaltySummary, setTurn: (i: number) => void },
  ) { }
}
