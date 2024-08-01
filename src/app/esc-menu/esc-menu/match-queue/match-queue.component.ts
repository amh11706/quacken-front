import { Component } from '@angular/core';

@Component({
  selector: 'q-match-queue',
  standalone: true,
  imports: [],
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
