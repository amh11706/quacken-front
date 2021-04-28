import { Component, OnDestroy, OnInit } from '@angular/core';

import { StatService, Stat, UserRank } from './stat.service';
import { WsService } from 'src/app/ws.service';
import { Observable, Subscription } from 'rxjs';
import { TierTitles } from './leaders/leaders.component';
import { OutCmd } from 'src/app/ws-messages';
import { FormControl } from '@angular/forms';
import { mergeMap, startWith, debounceTime } from 'rxjs/operators';
import { FriendsService } from 'src/app/chat/friends/friends.service';
import { ChatService } from 'src/app/chat/chat.service';

@Component({
  selector: 'q-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  tierTitles = TierTitles;
  myControl = new FormControl();
  searchedNames?: Observable<string[]>;

  constructor(
    public stat: StatService,
    public ws: WsService,
    public fs: FriendsService,
    private chat: ChatService,
  ) { }

  ngOnInit() {
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (!v || !this.ws.user || this.stat.target) return;
      this.stat.openUser(this.ws.user?.name);
    }));

    this.searchedNames = this.myControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        mergeMap(value => this.searchName(value)),
      );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  showLeaders(s: Stat) {
    this.stat.openLeaders(s.id);
    this.stat.profileTab = 3;
  }

  showRankLeaders(rank: UserRank) {
    this.stat.openLeaders(rank.rankArea * 100 - 1);
    this.stat.profileTab = 3;
  }

  reset() {
    this.stat.openUser(this.ws.user?.name || '');
  }

  showUser(name: string) {
    this.stat.openUser(name || this.ws.user?.name || '');
  }

  sendTell(friend: string) {
    this.chat.setTell(friend);
    document.getElementById('textinput')?.focus();
  }

  remove(friend: string) {
    this.ws.send(OutCmd.FriendRemove, friend);
  }

  unblock(blocked: string) {
    this.ws.send(OutCmd.Unblock, blocked);
  }

  // decline(inv: Invite) {
  //   this.fs.invites = this.fs.invites.filter(i => i !== inv);
  //   this.ws.send(OutCmd.FriendDecline, inv);
  // }

  invite(friend: string) {
    this.ws.send(OutCmd.ChatCommand, '/invite ' + friend);
  }
  private searchName(search: string): Promise<string[]> {
    if (search.length < 2) {
      const names = new Map([
        ...this.fs.lobby.map(m => m.from),
        ...this.fs.friends,
        ...this.fs.offline,
      ].map(n => [n, undefined]));

      return Promise.resolve(Array.from(names.keys()));
    }
    return this.ws.request(OutCmd.SearchNames, search);
  }

}

