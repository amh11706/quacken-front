import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'q-advanced-map',
  templateUrl: './advanced-map.component.html',
  styleUrls: ['./advanced-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedMapComponent {
  private _seed = '';
  @Input() set seed(value: string) {
    this._seed = value;
    this.seedParts = [];
    while (value.length) {
      this.seedParts.push(parseInt(value.substr(0, 2), 16));
      value = value.substr(2);
    }
  }

  get seed(): string { return this._seed; }
  @Output() seedChange = new EventEmitter<string>();
  seedParts: number[] = [];
  seedPartEdit = [
    'Whirl density', 'Wind density', 'Rock density', 'Flag density',
    'Whirl scramble 1', 'Whirl scramble 2',
    'Wind scramble 1', 'Wind scramble 2',
    'Rock scramble 1', 'Rock scramble 2',
    'Flag scramble 1', 'Flag scramble 2',
  ];

  randomSeed(): void {
    this.seedParts = [];
    for (let i = 0; i < 32; i++) {
      this.seedParts.push(Math.floor(Math.random() * 256));
    }
    this.setStringSeed();
  }

  setStringSeed(): void {
    this._seed = '';
    for (const part of this.seedParts) {
      this._seed += part.toString(16).padStart(2, '0');
    }
    this.seedChange.emit(this._seed);
  }
}
