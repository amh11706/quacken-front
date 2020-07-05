import { Component, OnInit, Input } from '@angular/core';

import { Card } from '../card/card.component';

@Component({
  selector: 'q-last-trick',
  templateUrl: './last-trick.component.html',
  styleUrls: ['./last-trick.component.css']
})
export class LastTrickComponent implements OnInit {
  @Input() cards: Card[] = [];

  cardValues = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  cardSuits = ['♦', '♣', '♥', '♠'];

  constructor() { }

  ngOnInit() {
  }

}
