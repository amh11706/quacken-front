import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { InCmd, OutCmd } from '../../ws/ws-messages';
import { WsService } from '../../ws/ws.service';
import { Invite } from '../types';
import { TeamMessage } from '../../lobby/cadegoose/types';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  allowInvite = false;
  fakeFs?: FriendsService;

  lobby$ = new BehaviorSubject<TeamMessage[]>([]);
  friends: string[] = [];
  private friendMap = new Set<string>();
  offline: string[] = [];
  blocked: string[] = [];
  private blockedMap = new Set<string>();
  invites: Invite[] = [];

  constructor(private ws: WsService) {
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

  private handleBlocks() {
    this.ws.subscribe(InCmd.BlockUser, m => {
      this.blocked.push(m);
      this.blockedMap.add(m);
      this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 3, from: m, message: 'has been blocked.' } });
    });
    this.ws.subscribe(InCmd.UnblockUser, m => {
      this.blocked = this.blocked.filter(n => m !== n);
      this.blockedMap.delete(m);
      this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 3, from: m, message: 'has been unblocked.' } });
    });
  }

  private handlePlayers() {
    this.ws.subscribe(InCmd.UpdateUser, r => {
      const users = this.lobby$.getValue().map(u => {
        if (u.from === r.from) return { ...u, ...r };
        return u;
      });
      this.lobby$.next(users);
    });
    this.ws.subscribe(InCmd.PlayerList, r => {
      this.lobby$.next(r as TeamMessage[]);
    });
    this.ws.subscribe(InCmd.PlayerAdd, m => {
      const lobby = this.lobby$.getValue();
      lobby.push(m as TeamMessage);
      this.lobby$.next([...lobby]);
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
      this.friendMap = new Set([...this.friends, ...this.offline]);
      this.blocked = r.blocked || [];
      this.blockedMap = new Set(r.blocked);
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
      this.friendMap.add(u.from);
      this.invites = this.invites.filter(i => i.ty !== 0 || i.f !== u.from);
      this.ws.dispatchMessage({
        cmd: InCmd.ChatMessage,
        data: { ...u, copy: 1, type: 3, message: 'has been added to your friend list.' },
      });
    });
    this.ws.subscribe(InCmd.FriendRemove, u => {
      this.friends = this.friends.filter(f => f !== u.from);
      this.offline = this.offline.filter(f => f !== u.from);
      this.friendMap.delete(u.from);
      this.ws.dispatchMessage({
        cmd: InCmd.ChatMessage,
        data: { ...u, copy: 1, type: 3, message: 'has been removed from your friend list.' },
      });
    });
  }

  isFriend(name: string): boolean {
    return this.friendMap.has(name);
  }

  isBlocked(name: string): boolean {
    return this.blockedMap.has(name);
  }
}
