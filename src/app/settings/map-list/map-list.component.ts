import { Component, OnInit } from '@angular/core';
import { OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'q-map-list',
  templateUrl: './map-list.component.html',
  styleUrls: ['./map-list.component.scss']
})
export class MapListComponent implements OnInit {
  maplist: any;
  setting = {
    admin: true, id: 18, group: 'l/cade', name: 'map', type: 'customMap', label: 'Custom Map', cmd: OutCmd.CgMapList
  }
  constructor(public ws: WsService, public ss: SettingsService){}

  async ngOnInit() {
    this.maplist = await this.ws.request(OutCmd.CgMapList);
  }

  selectMap(id:number){
    let rand = Math.floor(Math.random() * this.maplist.length);
    this.ss.save({
      id: this.setting.id,
      name: this.setting.name,
      value: id < 0 ? this.maplist[rand].id : +"null",
      group: this.setting.group,
      data: id < 0 ? this.maplist[rand].name : "Generated",
    });
  }
}
