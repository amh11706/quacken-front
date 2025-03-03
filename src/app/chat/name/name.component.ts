import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

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

interface MenuOption {
  label: string;
  action: () => void;
}

const BotRegex = /Bot\d{1,4}/;

@Component({
  selector: 'q-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class NameComponent implements OnChanges {
  @Input() message = { from: '' } as Partial<TeamMessage> & { from: string };
  @Input() offline = false;
  tierTitles = TierTitles;
  findCustomEmoji = FindCustomEmoji;
  emoji = '';
  friend = false;
  blocked = false;
  bot = false;
  menuItems: MenuOption[] = [];
  private lastFrom = '';

  constructor(
    public chat: ChatService,
    public stat: StatService,
    public ws: WsService,
    public fs: FriendsService,
    private kbs: KeyBindingService,
    private esc: EscMenuService,
    private ss: SettingsService,
  ) { }

  ngOnChanges(): void {
    if (this.message.from === this.lastFrom) return;
    this.lastFrom = this.message.from || '';
    this.friend = this.fs.isFriend(this.lastFrom);
    this.blocked = this.fs.isBlocked(this.lastFrom);
    this.bot = this.message.copy === 0 || BotRegex.test(this.lastFrom);
    this.emoji = '';
    if (this.message.d) this.emoji = this.findCustomEmoji(this.message.d) as string;
  }

  updateMenu(): void {
    this.menuItems = this.getMenuItems();
  }

  private getMenuItems(): MenuOption[] {
    const from = this.message.from;
    if (this.bot) {
      return [{
        label: 'It\'s a bot',
        action: () => this.openProfile(),
      }];
    }
    if (from === 'Guest' && from === this.ws.user.name) {
      return [{
        label: 'It\'s you. Create an account for more options.',
        action: () => null,
      }];
    }
    if (from === this.ws.user.name) {
      return [
        { label: 'Your Profile', action: () => this.openProfile() },
        { label: 'Set Emoji', action: () => this.openEmoji() },
      ];
    }

    return [
      { label: 'Profile', action: () => this.openProfile() },
      ...this.chat.nameCommands.map(cmd => ({ label: cmd.title, action: () => this.sendCmd(cmd) })),
      this.fs.isFriend(from)
        ? { label: 'Remove Friend', action: () => this.remove() }
        : { label: 'Add Friend', action: () => this.add() },
      this.fs.isBlocked(from)
        ? { label: 'Unblock', action: () => this.unblock() }
        : { label: 'Block', action: () => this.block() },
    ];
  }

  private getName(): string {
    let name = this.message.from;
    if (name === 'Guest') name += `(${this.message.copy})`;
    return name ?? '';
  }

  openProfile(): void {
    if (this.message.from) void this.stat.openUser(this.message.from);
  }

  openEmoji(): void {
    void this.esc.openTab(3);
    this.ss.tabIndex = 4;
  }

  sendCmd(cmd: Command): void {
    if (cmd.params.length <= 1) {
      return this.ws.send(OutCmd.ChatCommand, `${cmd.base} ${this.getName()}`);
    }

    cmd.params[0]!.value = this.getName();
    this.kbs.emitAction(KeyActions.FocusChat);
    this.chat.selectedCommand$.next(cmd);
  }

  add(): void {
    if (this.message.from) this.ws.send(OutCmd.FriendInvite, this.message.from);
  }

  remove(): void {
    if (this.message.from) this.ws.send(OutCmd.FriendRemove, this.message.from);
  }

  block(): void {
    if (this.message.from) this.ws.send(OutCmd.Block, this.message.from);
  }

  unblock(): void {
    if (this.message.from) this.ws.send(OutCmd.Unblock, this.message.from);
  }
}
