import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'q-map-card',
  templateUrl: './map-card.component.html',
  styleUrls: ['./map-card.component.scss']
})
export class MapCardComponent {
  @Input() map: any;
  @Input() setting: any;
  @Input() generatedSeed: string = '';
  @Output() selectedMap: EventEmitter<number> = new EventEmitter();
  generated: string = 'Generated';
  constructor(public ss : SettingsService) { }

  selectMap(id: number){
    this.selectedMap.emit(id);
  }
}
