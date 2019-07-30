import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../../ws.service';

@Component({
  selector: 'app-entry-status',
  templateUrl: './entry-status.component.html',
  styleUrls: ['./entry-status.component.css']
})
export class EntryStatusComponent implements OnInit, OnDestroy {
  treasure = [0, 0, 0, 0];
  titles = ['Cuttle Cake', 'Taco Locker', 'Pea Pod', 'Fried Egg'];

  time = '30:00';
  private subs: Subscription;

  constructor(private ws: WsService) { }

  ngOnInit() {
    this.subs = this.ws.subscribe('time', time => this.time = time);
    this.subs.add(this.ws.subscribe('turn', turn => this.treasure = turn.treasure));
    this.subs.add(this.ws.subscribe('joinLobby', lobby => this.treasure = lobby.treasure));
  }

  ngOnDestroy() {
    if (this.subs) this.subs.unsubscribe();
  }

}
