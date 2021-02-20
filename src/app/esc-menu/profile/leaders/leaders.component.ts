import { Component, OnInit } from '@angular/core';

import { StatService } from '../stat.service';
import { WsService } from 'src/app/ws.service';

@Component({
  selector: 'q-leaders',
  templateUrl: './leaders.component.html',
  styleUrls: ['./leaders.component.css']
})
export class LeadersComponent implements OnInit {
  stats = [
    { id: 1, name: '' },
  ];

  constructor(
    public stat: StatService,
    public ws: WsService,
  ) { }

  ngOnInit() {
  }

}
