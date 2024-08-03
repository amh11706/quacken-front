import { Component, Injector, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MainMenuService } from '../../lobby/cadegoose/main-menu/main-menu.service';
import { FriendsService } from '../../chat/friends/friends.service';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { SettingsService } from '../../settings/settings.service';
import { WsService } from '../../ws/ws.service';
import { EscMenuService } from '../esc-menu.service';

@Component({
  selector: 'q-match-queue',
  standalone: true,
  imports: [MatButtonModule, CommonModule, MatSliderModule, FormsModule],
  templateUrl: './match-queue.component.html',
  styleUrls: ['./match-queue.component.scss'],
  providers: [MainMenuService]
})
export class MatchQueueComponent implements OnInit {
  players: { name: string, username: string }[] = []; // Initially empty

  // Slider values
  slider1 = 35;
  slider2 = 35;
  slider3 = 60;
  slider4 = 75;
  slider5 = 25;
  slider6 = 750;

  constructor(
    public ws: WsService,
    public ss: SettingsService,
    public fs: FriendsService,
    public kbs: KeyBindingService,
    public es: EscMenuService,
    public injector: Injector
  ) {}

  ngOnInit(): void {
    // Initialization logic
  }

  joinQueue(): void {
    const username = this.ws.getUsername(); // Get the username from WsService
    if (!this.players.find(player => player.username === username)) {
      const newPlayer = { name: `Player ${this.players.length + 1}`, username: username };
      this.players.push(newPlayer);
    } else {
      console.warn(`User ${username} is already in the queue.`);
    }
  }

  leaveQueue(username: string): void {
    this.players = this.players.filter(player => player.username !== username);
  }
}
