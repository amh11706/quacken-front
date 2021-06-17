import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'q-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit {

  @Output() ratingUpdated = new EventEmitter<number>();
  @Input() rating: number = 0;
  @Input() isPecentage: boolean = false; //determines when to use specific template
  @Input() forTags: boolean = false;
  @Input() count: number = 0;
  starCount: number = 5;
  default_rating: number = 5;
  ratingArr: number[] = [];

  constructor() {
  }

  ngOnInit() {
    if(!this.isPecentage){
      for (let index = 0; index < this.starCount; index++) {
        this.ratingArr.push(index);
      }
    }
  }

  getStars(rating: number): string {
    const size = rating / this.default_rating * 100;
    return size + '%';
  }

  onClick(rating:number) {
    this.rating = rating;
    this.ratingUpdated.emit(rating);
    return false;
  }

  showIcon(index:number): string {
    if (this.rating >= index + 1) {
      return 'star';
    } else {
      return 'star_border';
    }
  }

}
