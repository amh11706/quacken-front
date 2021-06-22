import { Component, Input } from '@angular/core';

import { WsService } from '../../ws.service';
import { OutCmd } from '../../ws-messages';
import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { StatService } from '../../esc-menu/profile/stat.service';
import { FriendsService } from '../friends/friends.service';
import { ChatService, Message } from '../chat.service';

@Component({
  selector: 'q-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.css'],
})
export class NameComponent {
  @Input() message: Message = {} as Message;
  @Input() offline = false;

  constructor(
    public chat: ChatService,
    public stat: StatService,
    public ws: WsService,
    public fs: FriendsService,
    private es: EscMenuService,
  ) { }

  private getName(): string {
    let name = this.message.from;
    if (name === 'Guest') name += `(${this.message.copy})`;
    return name;
  }

  openProfile(): void {
    this.stat.openUser(this.message.from);
  }

  sendTell(): void {
    this.chat.sendTell(this.getName());
  }

  add(): void {
    this.ws.send(OutCmd.FriendInvite, this.message.from);
  }

  block(): void {
    this.ws.send(OutCmd.Block, this.message.from);
  }

  unblock(): void {
    this.ws.send(OutCmd.Unblock, this.message.from);
  }

  invite(): void {
    this.ws.send(OutCmd.ChatCommand, '/invite ' + this.getName());
  }

  kick(): void {
    this.ws.send(OutCmd.ChatCommand, '/kick ' + this.getName());
  }
}
