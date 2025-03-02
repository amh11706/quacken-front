import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Internal, InCmd } from '../../../ws/ws-messages';
import { WsService } from '../../../ws/ws.service';
import { LobbyService } from '../../lobby.service';
import { CadeLobby } from '../../cadegoose/types';

@Component({
    selector: 'q-entry-status',
    templateUrl: './entry-status.component.html',
    styleUrls: ['./entry-status.component.css'],
    standalone: false
})
export class EntryStatusComponent implements OnInit, OnDestroy {
  treasure = [0, 0, 0, 0];
  titles = ['Cuttle Cake', 'Taco Locker', 'Pea Pod', 'Fried Egg'];

  time = '30:00';
  protected subs = new Subscription();

  constructor(protected ws: WsService, protected lobbyService: LobbyService<CadeLobby>) { }

  ngOnInit(): void {
    this.subs.add(this.ws.subscribe(Internal.Time, time => this.time = time));
    this.subs.add(this.ws.subscribe(InCmd.Turn, t => this.treasure = t.treasure));
    this.subs.add(this.lobbyService.get().subscribe(l => this.treasure = l?.treasure || this.treasure));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
