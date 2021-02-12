import { Component, OnInit, Input } from '@angular/core';

import { ChatService, Message } from '../chat.service';
import { WsService } from 'src/app/ws.service';
import { FriendsService } from '../friends/friends.service';
import { OutCmd } from 'src/app/ws-messages';
import { EscMenuService } from 'src/app/esc-menu/esc-menu.service';
import { ProfileComponent } from 'src/app/esc-menu/profile/profile.component';
import { StatService } from 'src/app/esc-menu/profile/stat.service';

@Component({
  selector: 'q-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.css']
})
export class NameComponent implements OnInit {
  @Input() message: Message = {} as Message;
  @Input() offline = false;

  constructor(
    public chat: ChatService,
    public stat: StatService,
    public ws: WsService,
    public fs: FriendsService,
    private es: EscMenuService,
  ) { }

  ngOnInit() {
  }

  private getName(): string {
    let name = this.message.from;
    if (name === 'Guest') name += `(${this.message.copy})`;
    return name;
  }

  openProfile() {
    this.stat.openUser(this.message.from);
    this.stat.profileTab = 0;
    this.es.activeComponent = ProfileComponent;
    this.es.open = true;
  }

  sendTell() {
    this.chat.sendTell(this.getName());
  }

  add() {
    this.ws.send(OutCmd.FriendInvite, this.message.from);
  }

  block() {
    this.ws.send(OutCmd.Block, this.message.from);
  }

  unblock() {
    this.ws.send(OutCmd.Unblock, this.message.from);
  }

  invite() {
    this.ws.send(OutCmd.ChatCommand, '/invite ' + this.getName());
  }

  kick() {
    this.ws.send(OutCmd.ChatCommand, '/kick ' + this.getName());
  }

}
