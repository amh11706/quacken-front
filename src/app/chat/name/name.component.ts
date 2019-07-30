import { Component, OnInit, Input } from '@angular/core';

import { ChatService, Message } from '../chat.service';
import { WsService } from 'src/app/ws.service';
import { FriendsService } from '../friends/friends.service';
import { StatService } from '../stat/stat.service';

@Component({
  selector: 'app-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.css']
})
export class NameComponent implements OnInit {
  @Input() message: Message;
  @Input() offline: boolean;

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
    this.ws.send("friend", this.message.from);
  }

  block() {
    this.ws.send("block", this.message.from);
  }

  unblock() {
    this.ws.send("unblock", this.message.from);
  }

  invite() {
    this.ws.send("c/invite", this.getName());
  }

  kick() {
    this.ws.send("c/kick", this.getName());
  }

}
