import { Component, OnInit } from '@angular/core';

import { FriendsService, Invite } from './friends.service';
import { WsService } from '../../ws.service';
import { ChatService } from '../chat.service';
import { Router } from '@angular/router';
import { OutCmd } from 'src/app/ws-messages';
import { StatService } from 'src/app/esc-menu/profile/stat.service';

@Component({
  selector: 'q-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {
  links = [
    { title: 'Players in lobby', icon: 'group', path: 'lobby' },
    { title: 'Friends', icon: 'mood', path: 'friend' },
    { title: 'Blocked players', icon: 'block', path: 'block' },
  ];

  constructor(
    public fs: FriendsService,
    public ws: WsService,
    public stat: StatService,
    private chat: ChatService,
    private router: Router,
  ) { }

  ngOnInit() {
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

  accept(inv: Invite) {
    this.fs.invites = this.fs.invites.filter(i => i !== inv);
    if (inv.ty === 0) this.ws.send(OutCmd.FriendAdd, inv.f);
    else this.router.navigate(['lobby', inv.tg]);
  }

  decline(inv: Invite) {
    this.fs.invites = this.fs.invites.filter(i => i !== inv);
    this.ws.send(OutCmd.FriendDecline, inv);
  }

  invite(friend: string) {
    this.ws.send(OutCmd.ChatCommand, '/invite ' + friend);
  }

}
