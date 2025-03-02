import { Component, OnInit, OnDestroy, ViewChild, Input, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Group, Tween } from '@tweenjs/tween.js';
import { ChatService } from './chat.service';
import { FriendsService } from './friends/friends.service';
import { Invite, Message } from './types';

@Component({
    selector: 'q-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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
    '#6600cc', // discord message
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

  private scrollTarget = 0;
  private isScrolling = false;
  private tweenGroup = new Group();

  private updateTween(): void {
    if (!this.isScrolling) return;
    this.tweenGroup.update();
    if (this.tweenGroup.getAll().length) requestAnimationFrame(() => this.updateTween());
    else this.isScrolling = false;
  }

  private lastScroll = 0;
  scrolledAny(event: Event): void {
    const el = event.target as HTMLElement;
    if (this.lastScroll > el.scrollTop) this.scrolledToBottom = false;
    else this.scrolledToBottom = el.scrollHeight - el.scrollTop < el.clientHeight + 35;
    this.lastScroll = el.scrollTop;
    if (!this.isScrolling) this.scrollTarget = el.scrollTop;
  }

  scrolled(event: WheelEvent): void {
    const el = this.output?.elementRef.nativeElement;
    if (!el) return;
    event.preventDefault();
    this.scrollTarget += event.deltaY * 0.5;
    if (this.scrollTarget < 0) this.scrollTarget = 0;
    if (this.scrollTarget > el.scrollHeight - el.clientHeight) this.scrollTarget = el.scrollHeight - el.clientHeight;

    this.tweenGroup.removeAll();
    new Tween(el, this.tweenGroup).to({ scrollTop: this.scrollTarget }, 100).start();
    this.isScrolling = true;
    this.updateTween();
  }

  accept(inv: Invite): Promise<boolean> | void {
    inv.resolved = true;
    if (inv.ty === 0) this.fs.addFriend(inv.f);
  }

  decline(inv: Invite): void {
    inv.resolved = true;
    this.fs.declineFriend(inv);
  }

  addMessage(_message?: Message): void {
    if (!this.output) return;
    const output = this.output;
    const el = output.elementRef.nativeElement;
    if (this.scrolledToBottom && !this.isScrolling) {
      setTimeout(() => {
        output.scrollTo({ bottom: 0 });
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        });
      });
    }
  }
}
