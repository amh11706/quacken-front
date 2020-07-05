import { Injectable } from '@angular/core';

import { WsService } from '../../ws.service';
import { Message } from '../chat.service';

export interface Invite {
  f: string;
  ty: number;
  tg: number;
}

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  open = true;
  selected = 'lobby';
  allowInvite = false;

  lobby: Message[] = [];
  friends: String[] = [];
  offline: String[] = [];
  blocked: string[] = [];
  invites: Invite[] = [];

  constructor(private ws: WsService) {
    this.tapMessages();
    this.handleBlocks();
    this.handlePlayers();
    this.handleFriends();
    this.handleInvites();
  }

  private tapMessages() {
    this.ws.subscribe('m', (m: Message) => {
      m.friend = this.isFriend(m.from);
      m.blocked = this.isBlocked(m.from);
    });
  }

  private handleBlocks() {
    this.ws.subscribe('block', (m: string) => {
      this.blocked.push(m);
      for (const n of this.lobby) if (n.from === m) n.blocked = true;
      this.ws.dispatchMessage({ cmd: 'm', data: { type: 1, message: m + ' has been blocked.' } });
    });
    this.ws.subscribe('unblock', (m: string) => {
      this.blocked = this.blocked.filter(n => m !== n);
      for (const n of this.lobby) if (n.from === m) n.blocked = false;
      this.ws.dispatchMessage({ cmd: 'm', data: { type: 1, message: m + ' has been unblocked.' } });
    });
  }

  private handlePlayers() {
    this.ws.subscribe('playerList', (r: Message[]) => {
      this.lobby = r || [];
      for (const m of r) {
        m.friend = this.isFriend(m.from);
        m.blocked = this.isBlocked(m.from);
      }
    });
    this.ws.subscribe('playerAdd', (m: Message) => {
      m.friend = this.isFriend(m.from);
      m.blocked = this.isBlocked(m.from);
      this.lobby.push(m);
      this.ws.dispatchMessage({
        cmd: 'm', data: {
          type: 1, message: `${m.from}(${m.copy}) has joined the lobby.`,
        }
      });
    });
    this.ws.subscribe('playerRemove', (m: Message) => {
      this.lobby = this.lobby.filter(n => m.from !== n.from || m.copy !== n.copy);
      this.ws.dispatchMessage({
        cmd: 'm', data: {
          type: 1, message: `${m.from}(${m.copy}) has left the lobby.`,
        }
      });
    });
  }

  private handleInvites() {
    this.ws.subscribe('invite', (u: Invite) => {
      this.invites.push(u);
      let message = u.f;
      if (u.ty === 0) message += ' has requested to add you as a friend.';
      else message += ' has invited you to join their lobby.';
      this.ws.dispatchMessage({ cmd: 'm', data: { type: 1, message } });
    });
    this.ws.subscribe('inviteRemove', (u: Invite) => {
      this.invites = this.invites.filter(i => i.tg !== u.tg || i.ty !== u.ty);
    });
  }

  private handleFriends() {
    this.ws.subscribe('friends', r => {
      this.friends = r.online || [];
      this.offline = r.offline || [];
      this.blocked = r.blocked || [];
    });
    this.ws.subscribe('friendOnline', (u: string) => {
      this.friends.push(u);
      this.offline = this.offline.filter(f => f !== u);
      this.ws.dispatchMessage({ cmd: 'm', data: { type: 1, message: u + ' has logged on.' } });
    });
    this.ws.subscribe('friendOffline', (u: string) => {
      this.offline.push(u);
      this.friends = this.friends.filter(f => f !== u);
      this.ws.dispatchMessage({ cmd: 'm', data: { type: 1, message: u + ' has logged off.' } });
    });
    this.ws.subscribe('friendAdd', (u: string) => {
      this.friends.push(u);
      this.invites = this.invites.filter(i => i.ty !== 0 || i.f !== u);
      for (const n of this.lobby) if (n.from === u) n.friend = true;
      this.ws.dispatchMessage({ cmd: 'm', data: { type: 1, message: u + ' has been added to your friend list.' } });
    });
    this.ws.subscribe('friendRemove', (u: string) => {
      this.friends = this.friends.filter(f => f !== u);
      this.offline = this.offline.filter(f => f !== u);
      for (const n of this.lobby) if (n.from === u) n.friend = false;
      this.ws.dispatchMessage({ cmd: 'm', data: { type: 1, message: u + ' has been removed from your friend list.' } });
    });
  }

  isFriend(name: string): boolean {
    for (const n of this.friends) if (n === name) return true;
    return false;
  }

  isBlocked(name: string): boolean {
    for (const n of this.blocked) if (n === name) return true;
    return false;
  }
}
