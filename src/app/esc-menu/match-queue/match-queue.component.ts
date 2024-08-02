import { CommonModule } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MainMenuService } from '../../lobby/cadegoose/main-menu/main-menu.service';
import { FriendsService } from '../../chat/friends/friends.service';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { SettingsService } from '../../settings/settings.service';
import { WsService } from '../../ws/ws.service';
import { EscMenuService } from '../esc-menu.service';

@Component({
  selector: 'q-match-queue',
  standalone: true,
  imports: [MatButtonModule ,
    CommonModule, MatSliderModule, FormsModule
  ],
  templateUrl: './match-queue.component.html',
  styleUrl: './match-queue.component.scss',
  providers: [MainMenuService]})
export class MatchQueueComponent implements OnInit {
  players = [
    // Initially empty
    { name: 'Player 1', username: 'player1' },
    { name: 'Player 2', username: 'player2' },
    { name: 'Player 3', username: 'player3' },
    // Add more players as needed
  ];
  // Slider values
  slider1 = 35;
  slider2 = 60;
  slider3 = 200;

  constructor(
   public ws: WsService,
   public ss: SettingsService,
   public fs: FriendsService,
   public kbs: KeyBindingService,
   public es: EscMenuService,
   public injector: Injector,

  ) {}

  ngOnInit(): void {
    // Initialization logic
  }

  joinQueue(username: string): void {
    const newPlayer = { name: `Player ${this.players.length + 1}`, username: username };
    this.players.push(newPlayer);
  }

  leaveQueue(username: string): void {
    this.players = this.players.filter(player => player.username !== username);
  }
}
 




