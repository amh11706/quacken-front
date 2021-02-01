import { Component, OnInit } from '@angular/core';

import { StatService } from './stat.service';
import { WsService } from 'src/app/ws.service';

@Component({
  selector: 'q-stat',
  templateUrl: './stat.component.html',
  styleUrls: ['./stat.component.css']
})
export class StatComponent implements OnInit {
  constructor(
    public stat: StatService,
    public ws: WsService,
  ) {
    this.stat.target = this.ws.user?.name || '';
  }

  ngOnInit() {
  }

}
