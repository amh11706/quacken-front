import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'q-map-card',
  templateUrl: './map-card.component.html',
  styleUrls: ['./map-card.component.scss']
})
export class MapCardComponent implements OnInit{
  @Input() map: any;
  @Input() setting: any;
  defaultRating: number[] = [0,0,0,0,0]
  rating: number[] = [0,0,0,0,0]
  list: string[] = ["1v1", "Flags", "Cade"]
  constructor(public ss : SettingsService) { }

  ngOnInit(): void {
    this.rating = this.defaultRating;
    if (this.map?.rating && this.map?.rating > 0) {
      for( let i = 0; i < this.map?.rating; i++){
        this.rating[i] = 1;
      }
    }
  }

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
