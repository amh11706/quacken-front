import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsService } from '../../settings.service';
import { Settings } from '../../setting/settings';
import { WsService } from 'src/app/ws.service';
import { OutCmd } from 'src/app/ws-messages';

export interface MapOption {
  id: number
  description: string,
  name: string,
  released: boolean
  userId: number
  username: string,
  tags: string[],
  ratingAverage: number;
  ratingCount: number;
  data?: number[][];
}

@Component({
  selector: 'q-map-card',
  templateUrl: './map-card.component.html',
  styleUrls: ['./map-card.component.scss']
})

export class MapCardComponent {
  @Input() map?: MapOption;
  @Input() setting?: typeof Settings['cadeMap'];
  @Output() selectedMap = new EventEmitter<number>();
  generated = 'Generated';
  seeds: string[] = [];

  constructor(public ss : SettingsService, public ws: WsService) { }

  selectMap(id: number) {
    this.selectedMap.emit(id);
    this.pushSeed((document.getElementById("seed") as HTMLInputElement).value);
  }

  async addSeed(seed: string) {
    this.pushSeed(seed);
    this.updateSeed(seed);
  }

  pushSeed(seed: string) {
    if (this.seeds.length > 8) this.seeds.shift();
    if (seed !== "" && !(this.seeds.find(item => item === seed))) {
      this.seeds.push(seed);
    }
  }

  updateSeed(seed: string) {
    this.ws.send(OutCmd.ChatCommand, "/seed " + seed);
  }
}
