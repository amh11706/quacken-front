import { Component, OnInit, Input, ElementRef } from '@angular/core';

import { ChatService, Message } from '../chat.service';
import { WsService } from 'src/app/ws.service';

@Component({
  selector: 'app-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.css']
})
export class NameComponent implements OnInit {
  @Input() message: Message;

  constructor(public chat: ChatService, public ws: WsService) { }

  ngOnInit() {
  }

  add(name: string) {
    this.ws.send("c/friend", name);
  }

  block(name: string) {
    this.ws.send("c/block", name);
  }

  unblock(name: string) {
    this.ws.send("c/unblock", name);
  }

}
