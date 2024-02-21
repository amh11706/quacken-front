import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { InCmd, OutCmd } from '../../ws/ws-messages';
import { WsService } from '../../ws/ws.service';
import { ChatMessage, Invite } from '../types';
import { TeamMessage } from '../../lobby/cadegoose/types';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  allowInvite = false;
  fakeFs?: FriendsService;

  lobby$ = new BehaviorSubject<TeamMessage[]>([]);
  friends: string[] = [];
  offline: string[] = [];
  blocked: string[] = [];
  invites: Invite[] = [];

  constructor(private ws: WsService) {
    this.tapMessages();
    this.handleBlocks();
    this.handlePlayers();
    this.handleFriends();
    this.handleInvites();
  }

  addFriend(name: string): void {
    this.ws.send(OutCmd.FriendAdd, name);
  }

  declineFriend(invite: Invite): void {
    this.ws.send(OutCmd.FriendDecline, invite);
  }

  private tapMessages() {
    this.ws.subscribe(InCmd.ChatMessage, (m: ChatMessage) => {
      m.friend = this.isFriend(m.from);
      m.blocked = this.isBlocked(m.from);
    });
  }

  private handleBlocks() {
    this.ws.subscribe(InCmd.BlockUser, m => {
      this.blocked.push(m);
      for (const n of this.lobby$.getValue()) if (n.from === m) n.blocked = true;
      this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 3, from: m, message: 'has been blocked.' } });
    });
    this.ws.subscribe(InCmd.UnblockUser, m => {
      this.blocked = this.blocked.filter(n => m !== n);
      for (const n of this.lobby$.getValue()) if (n.from === m) n.blocked = false;
      this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 3, from: m, message: 'has been unblocked.' } });
    });
  }

  private handlePlayers() {
    this.ws.subscribe(InCmd.PlayerList, (r: Record<number, ChatMessage>) => {
      const users = Object.values(r);
      for (const m of users) {
        m.friend = this.isFriend(m.from);
        m.blocked = this.isBlocked(m.from);
      }
      this.lobby$.next(users as TeamMessage[]);
    });
    this.ws.subscribe(InCmd.PlayerAdd, (m: ChatMessage) => {
      m.friend = this.isFriend(m.from);
      m.blocked = this.isBlocked(m.from);
      const lobby = this.lobby$.getValue();
      lobby.push(m as TeamMessage);
      this.lobby$.next(lobby);
      if (m.copy === 0) return;
      m.type = 3;
      m.message = 'has joined the lobby.';
      this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: m });
    });
    this.ws.subscribe(InCmd.PlayerRemove, m => {
      const lobby = this.lobby$.getValue().filter(n => m.from !== n.from || m.copy !== n.copy);
      this.lobby$.next(lobby);
      if (m.copy === 0) return;
      m.type = 3;
      m.message = 'has left the lobby.';
      this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: m });
    });
  }

  private handleInvites() {
    this.ws.subscribe(InCmd.InviteAdd, u => {
      this.invites.push(u);
      // let message = u.f;
      // if (u.ty === 0) message += ' has requested to add you as a friend.';
      // else message += ' has invited you to join their lobby.';
      this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 8, message: u, from: u.f } });
    });
    this.ws.subscribe(InCmd.InviteRemove, u => {
      this.invites = this.invites.filter(i => i.tg !== u.tg || i.ty !== u.ty);
    });
  }

  private handleFriends() {
    this.ws.subscribe(InCmd.FriendList, r => {
      this.friends = r.online || [];
      this.offline = r.offline || [];
      this.blocked = r.blocked || [];
    });
    this.ws.subscribe(InCmd.FriendOnline, u => {
      this.friends.push(u.from);
      this.offline = this.offline.filter(f => f !== u.from);
      this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { ...u, copy: 1, type: 3, message: 'has logged on.' } });
    });
    this.ws.subscribe(InCmd.FriendOffline, u => {
      this.offline.push(u.from);
      this.friends = this.friends.filter(f => f !== u.from);
      this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { ...u, copy: 1, type: 3, message: 'has logged off.' } });
    });
    this.ws.subscribe(InCmd.FriendAdd, u => {
      this.friends.push(u.from);
      this.invites = this.invites.filter(i => i.ty !== 0 || i.f !== u.from);
      for (const n of this.lobby$.getValue()) if (n.from === u.from) n.friend = true;
      this.ws.dispatchMessage({
        cmd: InCmd.ChatMessage,
        data: { ...u, copy: 1, type: 3, message: 'has been added to your friend list.' },
      });
    });
    this.ws.subscribe(InCmd.FriendRemove, u => {
      this.friends = this.friends.filter(f => f !== u.from);
      this.offline = this.offline.filter(f => f !== u.from);
      for (const n of this.lobby$.getValue()) if (n.from === u.from) n.friend = false;
      this.ws.dispatchMessage({
        cmd: InCmd.ChatMessage,
        data: { ...u, copy: 1, type: 3, message: 'has been removed from your friend list.' },
      });
    });
  }

  isFriend(name: string): boolean {
    for (const n of this.friends) if (n === name) return true;
    for (const n of this.offline) if (n === name) return true;
    return false;
  }

  isBlocked(name: string): boolean {
    for (const n of this.blocked) if (n === name) return true;
    return false;
  }
}
