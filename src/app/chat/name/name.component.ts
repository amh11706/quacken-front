import { Component, OnInit, Input, ElementRef } from '@angular/core';

import { ChatService } from '../chat.service';

@Component({
  selector: 'app-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.css']
})
export class NameComponent implements OnInit {
  @Input() name: string;
  @Input() copy: number;
  @Input() input: ElementRef;

  constructor(private chat: ChatService) { }

  ngOnInit() {
  }

  clickName() {
    if (this.chat.value) this.chat.commandHistory.push(this.chat.value);
    this.chat.value = '/tell ' + this.name;
    if (this.name === 'Guest') this.chat.value += `(${this.copy})`;
    this.chat.value += ' ';
    this.input.nativeElement.focus();
  }

}
