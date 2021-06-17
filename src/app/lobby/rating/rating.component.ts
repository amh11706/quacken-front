import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'q-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit {

  @Output() private ratingUpdated = new EventEmitter<number>();
  rating: number = 0;
  starCount: number = 5;
  ratingArr: number[] = [];

  constructor() {
  }

  ngOnInit() {
    for (let index = 0; index < this.starCount; index++) {
      this.ratingArr.push(index);
    }
  }
  onClick(rating:number) {
    this.rating = rating;
    this.ratingUpdated.emit(rating);
    return false;
  }

  showIcon(index:number) {
    if (this.rating >= index + 1) {
      return 'star';
    } else {
      return 'star_border';
    }
  }

}
