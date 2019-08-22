import { Injectable } from '@angular/core';

import { WsService } from 'src/app/ws.service';
import { FriendsService } from '../friends/friends.service';
import { WindowService } from 'src/app/window.service';

export interface Stat {
  id: number,
  name: string,
  value: number,
  suffix?: number,
}

export interface Leader {
  name: string,
  value: number,
  details?: string,
  clean?: boolean,
  seed?: string,
  from?: string,
  friend?: boolean,
}

export interface Column {
  title: string,
  property: string,
}

const mapColumns: Column[] = [
  { title: 'Details', property: 'details' },
  { title: 'Fresh Seed', property: 'clean' },
  { title: 'Seed', property: 'seed' },
];

@Injectable({
  providedIn: 'root'
})
export class StatService {
  open = false;
  target = '';
  stats: Stat[] = [];

  leadersOpen = false;
  id = 0;
  groupName = '';
  leaders: Leader[] = [];
  columns: Column[] = [];

  constructor(
    private ws: WsService,
    private fs: FriendsService,
    private wd: WindowService,
  ) {
    this.ws.subscribe('stat/user', stats => this.stats = stats);
    this.ws.subscribe('stat/leaders', (leaders: Leader[]) => {
      this.leaders = leaders;
      if (!leaders || !leaders.length) return;

      if (leaders[0].seed) this.columns = mapColumns;
      else this.columns = [];
      for (const l of leaders) {
        l.from = l.name;
        l.friend = this.fs.isFriend(l.name);
      }
    });
    this.ws.connected$.subscribe(value => {
      if (!value) {
        this.open = false;
        this.leadersOpen = false;
      }
    });
  }

  openUser(name: string) {
    this.target = name;
    this.open = true;
    this.refresh();
    this.wd.active = 'stat';
  }

  openLeaders(id: number, name: string) {
    this.id = id;
    this.groupName = name;
    this.leadersOpen = true;
    this.refreshLeaders();
    this.wd.active = 'leaders';
  }

  refresh() {
    this.stats = [];
    this.ws.send('stat/user', this.target);
  }

  refreshLeaders() {
    this.leaders = [];
    this.ws.send('stat/leaders', this.id);
  }
}
