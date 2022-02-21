import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WsService } from '../../../ws.service';
import { Internal, OutCmd } from '../../../ws-messages';
import { SettingsService } from '../../settings.service';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';

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
  ratingMine?: number;
  data?: number[][];
}

@Component({
  selector: 'q-map-card',
  templateUrl: './map-card.component.html',
  styleUrls: ['./map-card.component.scss'],
})

export class MapCardComponent {
  @Input() map?: MapOption;
  @Input() disabled = false;
  @Input() set description(d: string) {
    if (this.map && this.map?.id > 0) return;
    this.pushSeed(d);
  }

  @Output() selectedMap = new EventEmitter<number>();
  generated = 'Generated';
  seeds: string[] = [];

  constructor(public ss: SettingsService, public ws: WsService, private es: EscMenuService) { }

  selectMap(id: number): void {
    this.selectedMap.emit(id);
  }

  pushSeed(seed: string): void {
    if (seed !== '' && !(this.seeds.find(item => item === seed))) {
      this.seeds.push(seed);
      if (this.seeds.length > 8) this.seeds.shift();
    }
  }

  updateSeed(seed: string): void {
    this.ws.send(OutCmd.ChatCommand, '/seed ' + seed);
  }

  openAdvanced(): void {
    this.ws.dispatchMessage({ cmd: Internal.OpenAdvanced });
    this.es.open = false;
  }
}
