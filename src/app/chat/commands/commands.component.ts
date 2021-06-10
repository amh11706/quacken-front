import { Component, Inject } from '@angular/core';
import { KeyActions } from 'src/app/settings/key-binding/key-actions';
import { OutCmd } from 'src/app/ws-messages';
import { KeyBindingService } from 'src/app/settings/key-binding/key-binding.service';
import { WsService } from 'src/app/ws.service';
import { ChatService, Message } from '../chat.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'q-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.scss']
})
export class CommandsComponent {

  constructor(
    private ws: WsService,
    private kbs: KeyBindingService,
    private chat: ChatService,
    @Inject(MAT_DIALOG_DATA) public message: Message,
    private ref: MatDialogRef<CommandsComponent>,
  ) { }

  clickCommand(c: any) {
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