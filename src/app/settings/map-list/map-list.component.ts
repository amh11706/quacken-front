import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { SettingsService } from '../settings.service';

interface MapOption {
  id: number
  description: string,
  name: string,
  released: boolean
  userId: number
  username: string,
}

@Component({
  selector: 'q-map-list',
  templateUrl: './map-list.component.html',
  styleUrls: ['./map-list.component.scss']
})

export class MapListComponent implements OnInit {
  @Input() data: string = "";
  servermapList: MapOption[] = [];
  maplist = new ReplaySubject<MapOption[]>(1);
  setting = {
    admin: true, id: 18, group: 'l/cade', name: 'map', type: 'customMap', label: 'Custom Map', cmd: OutCmd.CgMapList
  }

  constructor(public ws: WsService, public ss: SettingsService) { }

  async ngOnInit() {
    this.servermapList = await this.ws.request(OutCmd.CgMapList);
    this.maplist.next(this.servermapList);
  }

  async selectMap(id: number) {
    console.log('select map', id)
    const maps = this.servermapList;
    console.log('selected map', id)
    const rand = Math.floor(Math.random() * maps.length);
    this.ss.save({
      id: this.setting.id,
      name: this.setting.name,
      value: id < 0 ? maps[rand].id : id,
      group: this.setting.group,
      data: id < 0 ? maps[rand].name : "Generated",
    });
  }

  filter(data: string) {
    if (data === "" || undefined) return this.maplist.next(this.servermapList);
    this.maplist.next(this.servermapList.filter(map => {
      const search = new RegExp(data, 'i')
      return search.test(map.name) || search.test(map.username);
    }));
  }
}
