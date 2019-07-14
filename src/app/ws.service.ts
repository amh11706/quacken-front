import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

interface Message {
  cmd: string,
  data?: any,
}

export interface TokenUser {
  id: number,
  name: string,
}

@Injectable({
  providedIn: 'root'
})
export class WsService {
  private socket: WebSocket;
  private token: string;
  private timeOut: number;
  private messages = new Map<string, Subject<any>>();
  private tokenParser = new JwtHelperService();
  user: TokenUser;
  connected = false;
  connected$ = new Subject<boolean>();

  reason: string;
  sId: number;
  copy: number;

  constructor(private router: Router) {
    this.subscribe('kick', (reason: string) => {
      this.close();
      this.reason = reason;
      localStorage.removeItem('token');
      this.router.navigate(['login']);
    });
    this.subscribe('n', (path: string) => {
      this.router.navigate([path]);
    });
    this.subscribe('sId', (id: number) => {
      this.sId = id;
    });
    this.subscribe('copy', (copy: number) => {
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

    this.socket = new WebSocket(location.port === '4200' ? 'wss://localhost/ws' : 'wss://' + location.hostname + '/ws');

    this.socket.onopen = () => {
      this.socket.send(token);
      this.connected = true;
      this.connected$.next(true);
    }

    this.socket.onmessage = message => this.dispatchMessage(JSON.parse(message.data));

    this.socket.onclose = () => {
      this.dispatchMessage({
        cmd: "m",
        data: { type: 1, message: "Connection closed, attempting to reconnect..." },
      });
      this.timeOut = window.setTimeout(() => this.connect(), 5000);
    };
  }

  subscribe(cmd: string, next?: (value: any) => void, error?: (error: any) => void, complete?: () => void): Subscription {
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
    this.socket.close(1000, "Logged out");
    this.socket = null;
  }

  send(cmd: string, data?: any) {
    this.sendRaw(JSON.stringify({ cmd, data }));
  }

  sendObj(data: any) {
    this.sendRaw(JSON.stringify(data));
  }

  sendRaw(data: string) {
    if (this.socket && this.socket.readyState === 1) this.socket.send(data);
    else setTimeout(() => this.sendRaw(data), 100)
  }
}
