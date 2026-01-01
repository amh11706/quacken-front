import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../../ws/ws.service';
import { OutCmd } from '../../ws/ws-messages';
import { FriendsService } from '../../chat/friends/friends.service';
import { ChatService } from '../../chat/chat.service';
import { TierTitles } from './leaders/leaders.component';
import { StatService } from './stat.service';
import { Stat, UserRank } from './types';
import { ActiveLobbyTypes } from '../../lobby/cadegoose/lobby-type';

@Component({
  selector: 'q-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ProfileComponent implements OnInit, OnDestroy {
  stat = inject(StatService);
  ws = inject(WsService);
  fs = inject(FriendsService);
  private chat = inject(ChatService);

  private sub = new Subscription();

  tierTitles = TierTitles;
  titles = { Cadegoose: 'Blockade' } as Record<string, string>;
  lobbyTypes = ActiveLobbyTypes;

  ngOnInit(): void {
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (!v || !this.ws.user || this.stat.target) return;
      void this.stat.openUser(this.ws.user?.name, false);
    }));
    this.showUser(this.stat.target);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  showLeaders(s: Stat): void {
    void this.stat.openLeaders(s.id);
  }

  showRankLeaders(rank: UserRank): void {
    void this.stat.openLeaders(rank.rankArea * 100 - 1);
  }

  reset(): void {
    void this.stat.openUser(this.ws.user?.name || '');
  }

  showUser(name: string): void {
    void this.stat.openUser(name || this.ws.user?.name || '', false);
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
