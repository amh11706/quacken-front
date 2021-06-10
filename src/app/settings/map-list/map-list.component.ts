import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TwodRenderComponent } from 'src/app/lobby/cadegoose/twod-render/twod-render.component';
import { OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { SettingComponent } from '../setting/setting.component';

@Component({
  selector: 'q-map-list',
  templateUrl: './map-list.component.html',
  styleUrls: ['./map-list.component.scss']
})
export class MapListComponent implements OnInit {
  maplist: any;
  constructor(public ws: WsService){}

  async ngOnInit() {
    this.maplist = await this.ws.request(OutCmd.CgMapList);
  }
}
