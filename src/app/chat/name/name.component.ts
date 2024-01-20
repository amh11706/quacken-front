import { Component, Input } from '@angular/core';

import { WsService } from '../../ws.service';
import { OutCmd } from '../../ws-messages';
import { StatService } from '../../esc-menu/profile/stat.service';
import { FriendsService } from '../friends/friends.service';
import { ChatService, Message, Command } from '../chat.service';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { KeyActions } from '../../settings/key-binding/key-actions';

@Component({
  selector: 'q-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.css'],
})
export class NameComponent {
  @Input() message: Partial<Message> = {} as Message;
  @Input() offline = false;

  constructor(
    public chat: ChatService,
    public stat: StatService,
    public ws: WsService,
    public fs: FriendsService,
    private kbs: KeyBindingService,
  ) { }

  private getName(): string {
    let name = this.message.from;
    if (name === 'Guest') name += `(${this.message.copy})`;
    return name ?? '';
  }

  openProfile(): void {
    if (this.message.from) this.stat.openUser(this.message.from);
  }

  sendCmd(cmd: Command): void {
    if (cmd.params.length <= 1) {
      return this.ws.send(OutCmd.ChatCommand, `${cmd.base} ${this.getName()}`);
    }
    this.chat.selectedCommand = cmd;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    cmd.params[0]!.value = this.getName();
    this.kbs.emitAction(KeyActions.FocusChat);
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
}
