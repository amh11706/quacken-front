import { Component, OnDestroy, OnInit } from '@angular/core';

import { StatService, Stat } from './stat.service';
import { WsService } from 'src/app/ws.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'q-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  constructor(
    public stat: StatService,
    public ws: WsService,
  ) { }

  ngOnInit() {
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (!v || !this.ws.user) return;
      this.stat.openUser(this.ws.user?.name);
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  showLeaders(s: Stat) {
    this.stat.openLeaders(s.statId);
    this.stat.profileTab = 2;
  }

  reset() {
    this.stat.openUser(this.ws.user?.name || '');
  }

  searchUser(e: Event) {
    if (e.target instanceof HTMLInputElement) this.stat.openUser(e.target.value || this.ws.user?.name || '');
  }

}
