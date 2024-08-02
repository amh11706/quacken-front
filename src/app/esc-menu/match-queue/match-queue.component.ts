import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'q-match-queue',
  standalone: true,
  imports: [MatButtonModule ,
    CommonModule, MatSliderModule, FormsModule
  ],
  templateUrl: './match-queue.component.html',
  styleUrl: './match-queue.component.scss'
})
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

  constructor() {}

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
 




