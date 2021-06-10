import { Component, Input } from '@angular/core';

@Component({
  selector: 'q-map-card',
  templateUrl: './map-card.component.html',
  styleUrls: ['./map-card.component.scss']
})
export class MapCardComponent {
  @Input() map: any;
  constructor() { }

  selectMap(id:number){
    console.log(this.map);
    console.log(id);
  }
}
