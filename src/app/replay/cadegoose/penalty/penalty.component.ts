import { Component, Inject } from '@angular/core';
import { toBlob } from 'html-to-image';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PenaltySummary } from '../types';

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
    standalone: false
})
export class PenaltyComponent {
  Penalties = Penalties;
  copied = false;
  copying = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { rows: PenaltySummary, setTurn: (i: number) => void },
  ) { }

  async copyPicture(): Promise<void> {
    if (this.copying) return;
    this.copying = true;
    const el = document.getElementById('screenshot');
    if (!el) return;
    const blob = await toBlob(el, {
      height: 700,
      style: {
        overflow: 'visible',
      },
    });
    (navigator.clipboard as any).write([
      new (window as any).ClipboardItem({
        'image/png': blob,
      }),
    ]);
    this.copied = true;
  }
}
