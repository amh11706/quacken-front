import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../../ws/ws.service';
import { OutCmd } from '../../ws/ws-messages';
import { FriendsService } from '../../chat/friends/friends.service';
import { ChatService } from '../../chat/chat.service';
import { TierTitles } from './leaders/leaders.component';
import { StatService } from './stat.service';
import { Stat, UserRank } from './types';

@Component({
  selector: 'q-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  ngOnInit(): void {
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (!v || !this.ws.user || this.stat.target) return;
      this.stat.openUser(this.ws.user?.name, false);
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  showLeaders(s: Stat): void {
    void this.stat.openLeaders(s.id);
    this.stat.setTab(3);
  }

  showRankLeaders(rank: UserRank): void {
    void this.stat.openLeaders(rank.rankArea * 100 - 1);
    this.stat.setTab(3);
  }

  reset(): void {
    this.stat.openUser(this.ws.user?.name || '');
  }

  showUser(name: string): void {
    this.stat.openUser(name || this.ws.user?.name || '');
  }

  sendTell(friend: string): void {
    this.chat.setTell(friend);
  }

  remove(friend: string): void {
    this.ws.send(OutCmd.FriendRemove, friend);
  }

  unblock(blocked: string): void {
    this.ws.send(OutCmd.Unblock, blocked);
  }

  // decline(inv: Invite) {
  //   this.fs.invites = this.fs.invites.filter(i => i !== inv);
  //   this.ws.send(OutCmd.FriendDecline, inv);
  // }

  invite(friend: string): void {
    this.ws.send(OutCmd.ChatCommand, '/invite ' + friend);
  }
}
