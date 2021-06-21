import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsService } from '../../settings.service';
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
  @Input() disabled = false;
  @Input() set description(d: string) {
    if (this.map && this.map?.id > 0) return;
    this.pushSeed(d);
  }
  @Output() selectedMap = new EventEmitter<number>();
  generated = 'Generated';
  seeds: string[] = [];

  constructor(public ss: SettingsService, public ws: WsService) { }

  selectMap(id: number) {
    this.selectedMap.emit(id);
  }

  pushSeed(seed: string) {
    if (seed !== '' && !(this.seeds.find(item => item === seed))) {
      this.seeds.push(seed);
      if (this.seeds.length > 8) this.seeds.shift();
    }
  }

  updateSeed(seed: string) {
    if ( seed.length != 64 ) return;
    this.ws.send(OutCmd.ChatCommand, '/seed ' + seed);
  }

  checkInputType(event: any) {
    const key = event.key;
    const cmd_key = event.metaKey;
    const ctrl_key = event.ctrlKey;
    const acceptedKeys = ["c", "v", "a"];
    if ((cmd_key && acceptedKeys.includes(key)) || (ctrl_key && acceptedKeys.includes(key))) return true;
    else event.preventDefault();
    return false;
  }
}
