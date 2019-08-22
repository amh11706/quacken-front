import { Component, OnInit, Input } from '@angular/core';

export interface Card {
  id: number,
  suit: number,
  value: number,
  valid?: boolean,
  selected?: boolean,
  position?: string,
  won?: boolean,
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() card: Card;

  constructor() { }

  ngOnInit() {
  }

}
