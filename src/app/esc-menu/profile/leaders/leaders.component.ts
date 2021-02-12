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
    { statId: 1, name: 'Lifetime Eggs', value: 9 },
    { statId: 2, name: 'Eggs This Week', value: 7 },
    { statId: 3, name: 'Fastest Egg', suffix: 'Turns', value: 19 },
    { statId: 4, name: 'Ducks Bombed', value: 9 },
    { statId: 5, name: 'Duck Heads Bombed', value: 2 },
    { statId: 6, name: 'Lifetime Cuttle Cakes', value: 2 },
    { statId: 7, name: 'Cuttle Cakes This Week', value: 2 },
    { statId: 8, name: 'Lifetime Taco Lockers', value: 0 },
    { statId: 9, name: 'Taco Lockers This Week', value: 0 },
    { statId: 10, name: 'Lifetime Pea Pods', value: 0 },
    { statId: 11, name: 'Pea Pods This Week', value: 0 },
    { statId: 12, name: 'Best Entry Score', value: 1877 },
  ];

  constructor(
    public stat: StatService,
    public ws: WsService,
  ) { }

  ngOnInit() {
  }

}
