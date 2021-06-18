import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsService } from '../../settings.service';
import { Settings } from '../../setting/settings';
import { DBTile } from 'src/app/map-editor/map-editor.component';

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
  @Output() generate = new EventEmitter<number>();
  @Output() selectedMap = new EventEmitter<number>();
  generated = 'Generated';
  constructor(public ss : SettingsService) { }

  selectMap(id: number){
    this.selectedMap.emit(id);
  }
}
