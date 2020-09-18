import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, ReplaySubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

import { InCmd, Internal, OutCmd } from './ws-messages';

interface Message {
  cmd: InCmd | Internal;
  data?: any;
}

export interface TokenUser {
  id: number;
  name: string;
  inventory?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WsService {
  private socket?: WebSocket;
  private token = '';
  private timeOut?: number;
  private messages = new Map<InCmd | Internal, Subject<any>>();
  private tokenParser = new JwtHelperService();
  user?: TokenUser;
  connected = false;
  connected$ = new ReplaySubject<boolean>(1);

  reason?: string;
  sId?: number;
  copy?: number;

  constructor(private router: Router) {
    this.subscribe(InCmd.Kick, (reason: string) => {
      this.close();
      this.reason = reason;
      localStorage.removeItem('token');
      this.router.navigate(['login']);
    });
    this.subscribe(InCmd.NavigateTo, (path: string) => {
      this.router.navigate([path]);
    });
    this.subscribe(InCmd.SessionId, (id: number) => {
      this.sId = id;
      this.connected = true;
      this.connected$.next(true);
    });
    this.subscribe(InCmd.Copy, (copy: number) => {
      this.copy = copy;
    });
  }

  connect(token = this.token) {
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
    }
    this.token = token;
    if (token === 'guest') this.user = { id: 0, name: 'Guest' };
    else this.user = this.tokenParser.decodeToken(token);

    this.socket = new WebSocket(location.port === '4200' ? 'wss://dev.superquacken.com/ws' : 'wss://' + location.hostname + '/ws');

    this.socket.onopen = () => {
      this.socket?.send(token);
    };

    this.socket.onmessage = message => this.dispatchMessage(JSON.parse(message.data));

    this.socket.onclose = () => {
      this.dispatchMessage({
        cmd: InCmd.ChatMessage,
        data: { type: 1, message: 'Connection closed, attempting to reconnect...' },
      });
      this.timeOut = window.setTimeout(() => this.connect(), 5000);
    };
  }

  subscribe(cmd: InCmd | Internal, next?: (value: any) => void, error?: (error: any) => void, complete?: () => void): Subscription {
    const sub = this.messages.get(cmd);
    if (sub && sub.observers.length) return sub.subscribe(next, error, complete);

    const newSub = new Subject<any>();
    this.messages.set(cmd, newSub);
    return newSub.subscribe(next, error, complete);
  }

  dispatchMessage(message: Message) {
    const sub = this.messages.get(message.cmd);
    if (sub) sub.next(message.data);
    else console.log('Unhandled message:', message);
  }

  close() {
    this.connected = false;
    this.connected$.next(false);
    window.clearTimeout(this.timeOut);
    if (!this.socket) return;

    this.socket.onclose = null;
    this.socket.close(1000, 'Logged out');
    delete this.socket;
  }

  send(cmd: OutCmd, data?: any) {
    this.sendRaw(JSON.stringify({ cmd, data }));
  }

  softSend(cmd: OutCmd, data?: any) {
    if (this.connected) this.sendRaw(JSON.stringify({ cmd, data }));
  }

  sendObj(data: any) {
    this.sendRaw(JSON.stringify(data));
  }

  sendRaw(data: string) {
    if (this.connected && this.socket) return this.socket.send(data);
    const sub = this.connected$.subscribe((connected: boolean) => {
      if (!connected) return;
      this.socket?.send(data);
      sub.unsubscribe();
    });
  }
}
