import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../../ws.service';
import { OutCmd } from '../../ws-messages';
import { FriendsService } from '../../chat/friends/friends.service';
import { ChatService } from '../../chat/chat.service';
import { TierTitles } from './leaders/leaders.component';
import { StatService, Stat, UserRank } from './stat.service';

@Component({
  selector: 'q-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  tierTitles = TierTitles;
  titles = { Cadegoose: 'Cadesim' } as any;

  constructor(
    public stat: StatService,
    public ws: WsService,
    public fs: FriendsService,
    private chat: ChatService,
  ) { }

  ngOnInit() {
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (!v || !this.ws.user || this.stat.target) return;
      this.stat.openUser(this.ws.user?.name, false);
    }));
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
}
