import { Component, OnInit } from '@angular/core';

import { StatService } from '../stat/stat.service';
import { WsService } from 'src/app/ws.service';

@Component({
  selector: 'app-leaders',
  templateUrl: './leaders.component.html',
  styleUrls: ['./leaders.component.css']
})
export class LeadersComponent implements OnInit {
  constructor(
    public stat: StatService,
    public ws: WsService,
  ) { }

  ngOnInit() {
  }

}
