import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { WsService } from '../../ws/ws.service';
import { OutCmd } from '../../ws/ws-messages';
import { StatService } from '../../esc-menu/profile/stat.service';
import { FriendsService } from '../friends/friends.service';
import { ChatService } from '../chat.service';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { Command } from '../types';
import { TierTitles } from '../../esc-menu/profile/leaders/leaders.component';
import { TeamMessage } from '../../lobby/cadegoose/types';
import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { SettingsService } from '../../settings/settings.service';
import { FindCustomEmoji } from '../../settings/account/account.component';

@Component({
  selector: 'q-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameComponent {
  @Input() message = {} as Partial<TeamMessage> & { from: string };
  @Input() offline = false;
  tierTitles = TierTitles;
  findCustomEmoji = FindCustomEmoji;

  constructor(
    public chat: ChatService,
    public stat: StatService,
    public ws: WsService,
    public fs: FriendsService,
    private kbs: KeyBindingService,
    private esc: EscMenuService,
    private ss: SettingsService,
  ) { }

  private getName(): string {
    let name = this.message.from;
    if (name === 'Guest') name += `(${this.message.copy})`;
    return name ?? '';
  }

  openProfile(): void {
    if (this.message.from) this.stat.openUser(this.message.from);
  }

  openEmoji(): void {
    this.esc.activeTab$.next(4);
    this.ss.tabIndex = 4;
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
