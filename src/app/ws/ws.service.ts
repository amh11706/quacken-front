import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, ReplaySubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from '../../environments/environment';
import { InCmd, Internal, OutCmd } from './ws-messages';
import { AuthGuard } from '../auth.guard';
import { InMessage, InputCmds, InputlessCmds, OutCmdInputTypes, OutCmdReturnTypes } from './ws-request-types';
import { SendCmdInputless, SendCmdInputs } from './ws-send-types';

const ClientVersion = 53;

export interface TokenUser {
  id: number;
  name: string;
  admin: number;
  inventory?: number;
}

@Injectable({
  providedIn: 'root',
})
export class WsService {
  static reason?: string;
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
  outMessages$ = new Subject<{ cmd: OutCmd, data: any, id?: number }>();
  fakeWs?: WsService;

  sId?: number;
  copy?: number;

  constructor(private router: Router, private guard: AuthGuard) {
    this.subscribe(InCmd.Kick, (reason: string) => {
      this.close();
      WsService.reason = reason;
      window.localStorage.removeItem('token');
      this.guard.triedPath = location.hash.substr(2);
      void this.router.navigate(['auth/login']);
    });
    this.subscribe(InCmd.NavigateTo, (path: string) => {
      void this.router.navigate([path]);
    });
    this.subscribe(InCmd.SessionId, (id: number) => {
      this.sId = id;
      this.connected = true;
      this.connected$.next(true);
    });
    this.subscribe(InCmd.Copy, (copy: number) => {
      this.copy = copy;
    });
    this.subscribe(InCmd.Reload, () => {
      const lastReload = sessionStorage.getItem('reloadTime');
      if (lastReload && +lastReload > new Date().valueOf() - 30000) {
        this.dispatchMessage({
          cmd: InCmd.ChatMessage,
          data: { type: 0, message: 'Outdated client. Please clear your cache then refresh the page.' },
        });
        this.close();
        return;
      }
      sessionStorage.setItem('reloadTime', String(new Date().valueOf()));
      location.reload();
    });
  }

  connect(token = this.token): void {
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
    }
    this.token = token;
    if (token === 'guest') this.user = { id: 0, name: 'Guest', admin: 0 };
    else this.user = this.tokenParser.decodeToken(token) || undefined;

    this.socket = new WebSocket(environment.ws);

    this.socket.onopen = () => {
      this.socket?.send(JSON.stringify({ token, ClientVersion }));
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

  subscribe(
    cmd: InCmd | Internal, next?: (value: any) => void, error?: (e: any) => void, complete?: () => void,
  ): Subscription {
    const sub = this.messages.get(cmd);
    if (sub && sub.observers.length) return sub.subscribe(next, error, complete);

    const newSub = new Subject<any>();
    this.messages.set(cmd, newSub);
    return newSub.subscribe(next, error, complete);
  }

  dispatchMessage(message: InMessage): void {
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

  close(): void {
    this.connected = false;
    this.connected$.next(false);
    window.clearTimeout(this.timeOut);
    if (!this.socket) return;

    this.socket.onclose = null;
    this.socket.close(1000, 'Logged out');
    delete this.socket;
  }

  send<T extends SendCmdInputless>(cmd: T): void;
  send<T extends keyof SendCmdInputs>(cmd: T, data: SendCmdInputs[T], force?: boolean): void;
  send<T extends keyof SendCmdInputs>(cmd: T, data?: SendCmdInputs[T], force = false): void {
    const message = { cmd, data };
    this.outMessages$.next(message);
    if (this.connected || force) this.sendRaw(JSON.stringify(message));
  }

  request<T extends InputlessCmds>(cmd: T): Promise<OutCmdReturnTypes[T]>;
  request<T extends InputCmds>(cmd: T, data: OutCmdInputTypes[T]): Promise<OutCmdReturnTypes[T]>;
  request<T extends OutCmd>(cmd: T, data?: OutCmdInputTypes[T]): Promise<OutCmdReturnTypes[T]> {
    const message = { cmd, id: this.nextId, data };
    this.sendRaw(JSON.stringify(message));
    const p = new Promise<OutCmdReturnTypes[T]>((resolve) => {
      this.requests.set(this.nextId, resolve);
      this.nextId++;
    });
    this.outMessages$.next(message);
    return p;
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
