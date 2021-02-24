import { Component, OnInit } from '@angular/core';

import { StatService } from '../stat.service';

@Component({
  selector: 'q-leaders',
  templateUrl: './leaders.component.html',
  styleUrls: ['./leaders.component.css']
})
export class LeadersComponent implements OnInit {
  tierTitles = [
    'unranked',
    'bronze',
    'silver',
    'gold',
  ];

  constructor(
    public stat: StatService,
  ) { }

  ngOnInit() {
  }

}
