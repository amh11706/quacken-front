import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'q-match-queue',
  standalone: true,
  imports: [MatButtonModule ,
    CommonModule
  ],
  templateUrl: './match-queue.component.html',
  styleUrl: './match-queue.component.scss'
})
export class MatchQueueComponent {
  players = [
    { name: 'Player 1' },
    { name: 'Player 2' },
    { name: 'Player 3' },
    // Add more players as needed
  ];

  joinQueue() {
    const newPlayer = { name: `Player ${this.players.length + 1}` };
    this.players.push(newPlayer);
  }
 


}

