import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Internal, InCmd } from 'src/app/ws-messages';

import { WsService } from '../../../ws.service';
import { Lobby } from '../../lobby.component';
import { Turn } from '../boats/boats.component';

@Component({
  selector: 'q-entry-status',
  templateUrl: './entry-status.component.html',
  styleUrls: ['./entry-status.component.css']
})
export class EntryStatusComponent implements OnInit, OnDestroy {
  treasure = [0, 0, 0, 0];
  titles = ['Cuttle Cake', 'Taco Locker', 'Pea Pod', 'Fried Egg'];

  time = '30:00';
  protected subs = new Subscription();

  constructor(protected ws: WsService) { }

  ngOnInit() {
    this.subs = this.ws.subscribe(Internal.Time, (time: string) => this.time = time);
    this.subs.add(this.ws.subscribe(InCmd.Turn, (t: Turn) => this.treasure = t.treasure));
    this.subs.add(this.ws.subscribe(Internal.Boats, (l: Lobby) => this.treasure = l.treasure || this.treasure));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
