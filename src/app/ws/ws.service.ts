import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, firstValueFrom, BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Title } from '@angular/platform-browser';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { InCmd, Internal, OutCmd } from './ws-messages';
import { AuthGuard } from '../auth.guard';
import { InputCmds, InputlessCmds, OutCmdInputTypes, OutCmdReturnTypes, OutRequest } from './ws-request-types';
import { OutMessage, SendCmdInputless, SendCmdInputs } from './ws-send-types';
import { InMessage, SubscribeData } from './ws-subscribe-types';

const ClientVersion = 93;

export interface TokenUser {
  id: number;
  name: string;
  admin: number;
  d?: string;
  inventory?: number;
}

@Injectable()
export class WsService implements OnDestroy {
  static reason?: string;
  private socket?: WebSocket;
  private token = '';
  private timeOut?: number;
  private messages = new Map<InCmd | Internal, Subject<any>>();
  private requests = new Map<number, (value: any) => void>();
  private nextId = 1;
  private tokenParser = new JwtHelperService();
  user: TokenUser = { id: 0, name: 'Guest', admin: 0 };
  connected = false;
  connected$ = new BehaviorSubject<boolean>(false);
  outMessages$ = new Subject<OutMessage | OutRequest>();

  sId?: number;
  copy?: number;

  constructor(
    private router: Router,
    private http: HttpClient,
    private title: Title,
  ) {
    this.subscribe(InCmd.Kick, (reason: string) => {
      this.close();
      WsService.reason = reason;
      window.localStorage.removeItem('token');
      AuthGuard.triedPath = location.hash.substr(2) || '';
      void this.router.navigate(['auth/login']);
    });
    this.subscribe(InCmd.NavigateTo, path => {
      void this.router.navigate([path]);
    });
    this.subscribe(InCmd.SessionId, id => {
      this.sId = id;
      this.connected = true;
      this.connected$.next(true);
    });
    this.subscribe(InCmd.Copy, copy => {
      this.copy = copy;
      this.setTitle();
    });
    this.subscribe(InCmd.SetUser, user => {
      this.user = Object.assign({}, this.user, user);
      this.setTitle();
    });
    this.subscribe(InCmd.Reload, () => {
      const lastReload = sessionStorage.getItem('reloadTime');
      if (lastReload && +lastReload > new Date().valueOf() - 30000) {
        void this.dispatchMessage({
          cmd: InCmd.ChatMessage,
          data: { type: 0, message: 'Outdated client. Please clear your cache then refresh the page.', from: '' },
        });
        this.close();
        return;
      }
      sessionStorage.setItem('reloadTime', String(new Date().valueOf()));
      location.reload();
    });
  }

  ngOnDestroy(): void {
    this.close();
  }

  setTitle(): void {
    if (!this.connected) this.title.setTitle('Global Cadesim');
    else if (this.copy && this.copy > 1) this.title.setTitle(`${this.user.name}(${this.copy}) - Global Cadesim`);
    else this.title.setTitle(`${this.user.name} - Global Cadesim`);
  }

  connect(token = this.token): void {
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
    }
    this.token = token;
    if (token === 'guest') this.user = { id: 0, name: 'Guest', admin: 0 };
    else this.user = this.tokenParser.decodeToken(token) || { id: 0, name: 'Guest', admin: 0 };

    this.socket = new WebSocket(environment.ws);

    this.socket.onopen = () => {
      this.socket?.send(JSON.stringify({ token, ClientVersion }));
    };

    this.socket.onmessage = message => this.dispatchMessage(JSON.parse(message.data));

    this.socket.onclose = () => {
      this.connected = false;
      this.connected$.next(false);
      void this.dispatchMessage({
        cmd: InCmd.ChatMessage,
        data: { type: 1, message: 'Connection closed, attempting to reconnect...', from: '' },
      });
      this.timeOut = window.setTimeout(() => this.connect(), 5000);
    };
  }

  subscribe<T extends keyof SubscribeData>(
    cmd: T, next?: (value: SubscribeData[T]) => void, error?: (e: any) => void, complete?: () => void,
  ): Subscription {
    const sub = this.messages.get(cmd);
    if (sub && sub.observers.length) return sub.subscribe(next, error, complete);

    const newSub = new Subject<any>();
    this.messages.set(cmd, newSub);
    return newSub.subscribe(next, error, complete);
  }

  async dispatchMessage(message: InMessage & { httpid?: string }): Promise<void> {
    if (message.httpid) {
      message = await firstValueFrom(this.http.get<InMessage>(environment.api + '/httpmsg/' + message.httpid));
    }
    if (message.id) {
      const cb = this.requests.get(message.id);
      this.requests.delete(message.id);
      if (cb) cb(message.data);
      return;
    }
    const sub = this.messages.get(message.cmd);
    if (sub) sub.next(message.data);
    else console.info('Unhandled message:', message.cmd);
  }

  close(): void {
    this.connected = false;
    this.connected$.next(false);
    window.clearTimeout(this.timeOut);
    if (!this.socket) return;

    this.socket.onclose = null;
    this.socket.close(1000, 'Logged out');
    delete this.socket;
    this.setTitle();
  }

  send<T extends SendCmdInputless>(cmd: T): void;
  send<T extends keyof SendCmdInputs>(cmd: T, data: SendCmdInputs[T], force?: boolean): void;
  send<T extends keyof SendCmdInputs>(cmd: T, data?: SendCmdInputs[T], force = false): void {
    const message = { cmd, data };
    this.outMessages$.next(message as OutMessage);
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
    this.outMessages$.next(message as OutRequest);
    return p;
  }

  private sendRaw(data: string) {
    if (this.connected) return this.socket?.send(data);
    const sub = this.connected$.subscribe((connected: boolean) => {
      if (!connected) return;
      this.socket?.send(data);
      sub.unsubscribe();
    });
  }
}
