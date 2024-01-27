import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { WsService } from '../../ws/ws.service';
import { OutCmd } from '../../ws/ws-messages';
import { StatService } from '../../esc-menu/profile/stat.service';
import { FriendsService } from '../friends/friends.service';
import { ChatService, Command } from '../chat.service';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { ChatMessage } from '../types';

@Component({
  selector: 'q-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameComponent {
  @Input() message: Partial<ChatMessage> = {};
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    cmd.params[0]!.value = this.getName();
    this.kbs.emitAction(KeyActions.FocusChat);
    this.chat.selectedCommand$.next(cmd);
  }

  add(): void {
    if (this.message.from) this.ws.send(OutCmd.FriendInvite, this.message.from);
  }

  block(): void {
    if (this.message.from) this.ws.send(OutCmd.Block, this.message.from);
  }

  unblock(): void {
    if (this.message.from) this.ws.send(OutCmd.Unblock, this.message.from);
  }
}
