import { Component, OnInit, Input } from '@angular/core';

import { ChatService, Message } from '../chat.service';
import { WsService } from 'src/app/ws.service';
import { FriendsService } from '../friends/friends.service';
import { StatService } from '../stat/stat.service';
import { OutCmd } from 'src/app/ws-messages';

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
  ) { }

  ngOnInit() {
  }

  private getName(): string {
    let name = this.message.from;
    if (name === 'Guest') name += `(${this.message.copy})`;
    return name;
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
    // TODO readd commands
    // this.ws.send('c/invite', this.getName());
  }

  kick() {
    // TODO readd commands
    // this.ws.send('c/kick', this.getName());
  }

}
