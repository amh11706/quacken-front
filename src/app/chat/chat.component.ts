import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChatService, Message } from './chat.service';
import { FriendsService, Invite } from './friends/friends.service';

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
    '#9933ff', // discord message
    '#873600', // last seen message
    '#873600', // invitiation
    'maroon', // alert/broadcast
    '#5d7563', // team chat
  ];

  private subs = new Subscription();
  private scrolledToBottom = true;

  constructor(
    public chat: ChatService,
    private fs: FriendsService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    if (!this.output) return;
    const output = this.output;
    setTimeout(() => {
      output.scrollTo({ bottom: 0 });
      setTimeout(() => {
        const el = output.elementRef.nativeElement;
        el.scrollTop = el.scrollHeight;
      });
    }, 50);

    this.subs.add(this.chat.messages$.subscribe(m => this.addMessage(m[m.length - 1])));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  scrolled(): void {
    const el = this.output?.elementRef.nativeElement;
    if (!el) return;
    this.scrolledToBottom = el.scrollHeight - el.scrollTop < el.clientHeight + 100;
  }

  accept(inv: Invite): Promise<boolean> | void {
    inv.resolved = true;
    if (inv.ty === 0) this.fs.addFriend(inv.f);
    else return this.router.navigate(['lobby', inv.tg]);
  }

  decline(inv: Invite): void {
    inv.resolved = true;
    this.fs.declineFriend(inv);
  }

  addMessage(message?: Message): void {
    // if (message?.type === 6 && !this.disabled) {
    //   this.dialog.open(CommandsComponent, { data: message, height: '50vh' });
    //   return;
    // }
    if (!this.output) return;
    const output = this.output;
    const el = output.elementRef.nativeElement;
    if (this.scrolledToBottom) {
      setTimeout(() => {
        output.scrollTo({ bottom: 0 });
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        });
      });
    }
  }
}
