import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, ReplaySubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

import { InCmd, Internal, OutCmd } from './ws-messages';
import { environment } from 'src/environments/environment';

interface Message {
  cmd: InCmd | Internal;
  id?: number;
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
  private requests = new Map<number, (value: any) => void>();
  private nextId = 1;
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

    this.socket = new WebSocket(environment.ws);

    this.socket.onopen = () => {
      this.socket?.send(token);
    };

    this.socket.onmessage = message => this.dispatchMessage(JSON.parse(message.data));

    this.socket.onclose = () => {
      this.connected = false;
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
    if (message.id) {
      const cb = this.requests.get(message.id);
      this.requests.delete(message.id);
      if (cb) cb(message.data);
      return;
    }
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

  send(cmd: OutCmd, data?: any, force = false) {
    if (this.connected || force) this.sendRaw(JSON.stringify({ cmd, data }));
  }

  request(cmd: OutCmd, data?: any): Promise<any> {
    if (this.connected) this.sendRaw(JSON.stringify({ cmd, id: this.nextId, data }));
    return new Promise((resolve) => {
      if (!this.connected) return resolve();
      this.requests.set(this.nextId, resolve);
      this.nextId++;
    });
  }

  private sendRaw(data: string) {
    if (this.connected && this.socket) return this.socket.send(data);
    const sub = this.connected$.subscribe((connected: boolean) => {
      if (!connected) return;
      this.socket?.send(data);
      sub.unsubscribe();
    });
  }
}
