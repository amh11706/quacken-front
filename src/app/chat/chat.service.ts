import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import { InCmd, OutCmd } from '../ws/ws-messages';

import { WsService } from '../ws/ws.service';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
import { KeyActions } from '../settings/key-binding/key-actions';
import { Sounds, SoundService } from '../sound.service';
import { ChatMessage } from './types';

dayjs.extend(relativeTime);

export interface Command {
    base: string, title: string, params: { name: string, value: string }[], help: string
  }

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  commandHistory: string[] = [];
  messages: ChatMessage[] = [];
  messages$ = new BehaviorSubject<ChatMessage[]>([]);
  saveText = '';
  historyIndex = -1;
  commands$ = new BehaviorSubject<Command[]>([]);
  selectedCommand$ = new BehaviorSubject<Command>({ params: [] } as any);
  nameCommands: Command[] = [];

  constructor(
    private ws: WsService,
    private kbs: KeyBindingService,
    sound: SoundService,
  ) {
    this.messages$.next(this.messages);
    this.ws.subscribe(InCmd.ChatCommands, commands => {
      const lobbyCommands = commands.lobby as Command[];
      lobbyCommands.push(...commands.global);
      if (commands.lobbyAdmin) lobbyCommands.push(...commands.lobbyAdmin);

      let cmdFound = false;
      const selectedCommand = this.selectedCommand$.getValue();
      for (const cmd of lobbyCommands) {
        if (cmd.base === selectedCommand.base) {
          Object.assign(cmd, selectedCommand);
          this.selectedCommand$.next(cmd);
          cmdFound = true;
          continue;
        }
        cmd.title = cmd.base.substring(1);
        const params = cmd.params as any as string;
        cmd.params = params.replace(/[[\]<>]/g, '').split(' ').map(p => {
          return { name: p, value: p === 'new' ? p : '' };
        });
      }
      if (!cmdFound) this.selectedCommand$.next(lobbyCommands[0] ?? selectedCommand);
      this.nameCommands = lobbyCommands.filter(cmd => cmd.params[0]?.name === 'name');
      this.commands$.next(lobbyCommands);
    });

    this.ws.subscribe(InCmd.ChatMessage, (message: ChatMessage) => {
      // if (message.type === 6) return;
      if ((document.hidden && message.type === 5) || [8, 9].includes(message.type)) {
        void sound.play(Sounds.Notification);
      }
      this.messages.push(message);
      if (message.type === 5) {
        let command = '/tell ' + message.from;
        if (message.from === 'Guest') command += `(${message.copy})`;
        command += ' ';

        this.commandHistory = this.commandHistory.filter(entry => entry !== command);
        this.commandHistory.push(command);
      } else if (message.type === 7 && message.time) {
        const time = dayjs.unix(+message.time);
        message.time = time.format('D MMM YYYY HH:mm');
        message.ago = time.fromNow();
      }
      this.messages$.next(this.messages);
    });
    this.ws.connected$.subscribe(value => {
      if (!value) this.messages = [];
    });

    this.ws.subscribe(InCmd.FriendAdd, (u: string) => {
      for (const m of this.messages) if (m.from === u) m.friend = true;
    });
    this.ws.subscribe(InCmd.FriendRemove, (u: string) => {
      for (const m of this.messages) if (m.from === u) m.friend = false;
    });

    this.ws.subscribe(InCmd.BlockUser, (u: string) => {
      for (const m of this.messages) if (m.from === u) m.blocked = true;
    });
    this.ws.subscribe(InCmd.UnblockUser, (u: string) => {
      for (const m of this.messages) if (m.from === u) m.blocked = false;
    });
  }

  sendMessage(text: string): void {
    this.ws.send(OutCmd.ChatMessage, text);
  }

  sendCommand(text: string): void {
    this.ws.send(OutCmd.ChatCommand, text);
  }

  setTell(name: string): void {
    let selectedCommand = this.selectedCommand$.getValue();
    const param = selectedCommand.params.find(p => p.name === 'message');
    if (param?.value) this.commandHistory.push(param.value);
    selectedCommand = this.commands$.getValue().find(cmd => cmd.base === '/tell') || selectedCommand;
    const newParam = selectedCommand.params[0];
    if (newParam) newParam.value = name;
    this.selectedCommand$.next(selectedCommand);
    this.kbs.emitAction(KeyActions.FocusChat);
  }
}
