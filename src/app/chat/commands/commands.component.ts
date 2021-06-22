import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { KeyActions } from '../../settings/key-binding/key-actions';
import { OutCmd } from '../../ws-messages';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { WsService } from '../../ws.service';
import { ChatService, Message } from '../chat.service';

@Component({
  selector: 'q-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.scss'],
})
export class CommandsComponent {
  constructor(
    private ws: WsService,
    private kbs: KeyBindingService,
    private chat: ChatService,
    @Inject(MAT_DIALOG_DATA) public message: Message,
    private ref: MatDialogRef<CommandsComponent>,
  ) { }

  clickCommand(c: { base: string, params: string }): void {
    if (c.params) {
      const param = this.chat.selectedCommand.params.find(p => p.name === 'message');
      if (param?.value) this.chat.commandHistory.push(param.value);
      this.chat.selectedCommand = this.chat.commands.find(cmd => cmd.base === c.base) || this.chat.selectedCommand;
      this.kbs.emitAction(KeyActions.FocusChat);
      this.ref.close();
      return;
    }

    this.ws.send(OutCmd.ChatCommand, c.base);
    this.chat.commandHistory = this.chat.commandHistory.filter((entry: string) => entry !== c.base);
    this.chat.commandHistory.push(c.base);
  }
}
