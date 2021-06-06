import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { ReplaySubject, Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { ChatService, Message } from './chat.service';
import { InCmd, Internal, OutCmd } from '../ws-messages';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
import { KeyActions } from '../settings/key-binding/key-actions';
import { Invite } from './friends/friends.service';
import { Router } from '@angular/router';
import { CommandsComponent } from './commands/commands.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'q-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild(CdkVirtualScrollViewport, { static: true }) output?: CdkVirtualScrollViewport;
  @Input() disabled = false;
  colors = [
    '#873600', // info message
    '#873600', // HTML info message
    '#666', // lobby chat
    '#873600', // name with info message
    '#2874A6', // sent tell
    '#1A5276', // recieved tell
    '#873600', // command list
    '#873600', // last seen message
    '#873600', // invitiation
    'maroon', // alert/broadcast
    '#5d7563', // team chat
  ];
  messages$ = new ReplaySubject<Message[]>(1);

  private subs = new Subscription();

  constructor(
    private ws: WsService,
    public chat: ChatService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    if (!this.output) return;
    this.subs.add(this.ws.subscribe(InCmd.ChatMessage, (m) => this.addMessage(m)));
    this.subs.add(this.ws.subscribe(Internal.RefreshChat, () => this.addMessage()));
    const output = this.output;
    this.messages$.next(this.chat.messages);
    setTimeout(() => {
      output.scrollToIndex(this.chat.messages.length + 50);
    }, 50);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  accept(inv: Invite) {
    inv.resolved = true;
    if (inv.ty === 0) this.ws.send(OutCmd.FriendAdd, inv.f);
    else this.router.navigate(['lobby', inv.tg]);
  }

  decline(inv: Invite) {
    inv.resolved = true;
    this.ws.send(OutCmd.FriendDecline, inv);
  }

  addMessage(message?: Message): void {
    if (message?.type === 6 && !this.disabled) {
      this.dialog.open(CommandsComponent, { data: message });
      return;
    }
    if (!this.output) return;
    const output = this.output;
    const scrolled = output.elementRef.nativeElement;
    this.messages$.next(this.chat.messages);
    if (output.measureScrollOffset() + 100 >= scrolled.scrollHeight - scrolled.clientHeight) {
      setTimeout(() => output.scrollToIndex(this.chat.messages.length + 20));
    }
  }

}
