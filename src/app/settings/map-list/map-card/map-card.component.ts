import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'q-map-card',
  templateUrl: './map-card.component.html',
  styleUrls: ['./map-card.component.scss']
})
export class MapCardComponent {
  @Input() map: any;
  @Input() setting: any;

  constructor(public ss : SettingsService) { }

  selectMap(id:number, name: any){
    this.ss.save({
      id: this.setting.id,
      name: this.setting.name,
      value: id,
      group: this.setting.group,
      data: name,
    });
  }
}
