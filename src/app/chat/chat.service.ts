import { Injectable } from '@angular/core';
import moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { InCmd, OutCmd } from '../ws-messages';

import { WsService } from '../ws.service';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
import { KeyActions } from '../settings/key-binding/key-actions';
import { Sounds, SoundService } from '../sound.service';
moment.locale('en-GB');

export interface Message {
  type: number;
  message?: any;
  team?: number;
  op?: boolean;
  from: string;
  copy?: number;
  sId?: number;
  friend?: boolean;
  blocked?: boolean;
  time?: number | string;
  ago?: string;
  admin: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  commandsComponent: any;
  commandHistory: string[] = [];
  messages: Message[] = [];
  messages$ = new ReplaySubject<Message[]>(1);
  saveText = '';
  historyIndex = -1;
  commands: this['selectedCommand'][] = [];
  selectedCommand: {
    base: string, title: string, params: { name: string, value: string }[], help: string
  } = { params: [] } as any;

  constructor(
    private ws: WsService,
    private kbs: KeyBindingService,
    sound: SoundService,
  ) {
    this.messages$.next(this.messages);
    this.ws.subscribe(InCmd.ChatCommands, commands => {
      this.commands = commands.lobby;
      this.commands.push(...commands.global);
      if (commands.lobbyAdmin) this.commands.push(...commands.lobbyAdmin);
      this.commands = this.commands.filter(command => command.base !== '/help'); // remove /help from commands
      for (const cmd of this.commands) {
        cmd.title = cmd.base.substring(1);
        const params = cmd.params as any as string;
        cmd.params = params.replace(/[[\]<>]/g, '').split(' ').map(p => {
          return { name: p, value: p === 'new' ? p : '' };
        });
      }
      this.selectedCommand = this.commands[0] ?? this.selectedCommand;
    });

    this.ws.subscribe(InCmd.ChatMessage, (message: Message) => {
      if (message.type === 6) return;
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
        const time = moment.unix(+message.time);
        message.time = time.format('lll');
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
    const param = this.selectedCommand.params.find(p => p.name === 'message');
    if (param?.value) this.commandHistory.push(param.value);
    this.selectedCommand = this.commands.find(cmd => cmd.base === '/tell') || this.selectedCommand;
    const newParam = this.selectedCommand.params[0];
    if (newParam) newParam.value = name;
    this.kbs.emitAction(KeyActions.FocusChat);
  }

  sendTell(friend: string): void {
    this.setTell(friend);
    this.kbs.emitAction(KeyActions.FocusChat);
  }
}
