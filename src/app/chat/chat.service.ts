import { Injectable } from '@angular/core';

import { WsService } from '../ws.service';

export interface Message {
  type: number,
  message: any,
  from: string,
  copy: number,
  friend?: boolean,
  blocked?: boolean,
  names?: string[],
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  commandHistory: string[] = [];
  messages: Message[] = [];
  value = '';
  saveText = '';
  historyIndex = -1;

  constructor(private socket: WsService) {
    this.socket.subscribe('m', (message: Message) => {
      this.messages.push(message);
      if (message.type === 3) {
        message.names = message.message.split(',').sort();
      } else if (message.type === 5) {
        let command = '/tell ' + message.from;
        if (message.from === 'Guest') command += `(${message.copy})`;
        command += ' ';

        this.commandHistory = this.commandHistory.filter(entry => entry !== command);
        this.commandHistory.push(command);
      }
    });
    this.socket.connected$.subscribe(value => {
      if (!value) this.messages = [];
    });

    this.socket.subscribe('friendAdd', (u: string) => {
      for (const m of this.messages) if (m.from === u) m.friend = true;
    });
    this.socket.subscribe('friendRemove', (u: string) => {
      for (const m of this.messages) if (m.from === u) m.friend = false;
    });

    this.socket.subscribe('block', (u: string) => {
      for (const m of this.messages) if (m.from === u) m.blocked = true;
    });
    this.socket.subscribe('unblock', (u: string) => {
      for (const m of this.messages) if (m.from === u) m.blocked = false;
    });
  }

  setTell(name: string) {
    if (this.value) this.commandHistory.push(this.value);
    this.value = '/tell ' + name + ' ';
  }

  sendTell(friend: string) {
    this.setTell(friend);
    document.getElementById('textinput').focus();
  }

}
