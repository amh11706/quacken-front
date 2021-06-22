import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'q-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
})
export class RatingComponent implements OnInit {
  @Output() ratingUpdated = new EventEmitter<number>();
  @Input() rating = 0;
  @Input() isPecentage = false; // determines when to use specific template
  @Input() forTags = false;
  @Input() count = 0;
  starCount = 5;
  defaultRating = 5;
  ratingArr: number[] = [];
  alreadyVoted = false;

  ngOnInit(): void {
    if (!this.isPecentage) {
      for (let index = 0; index < this.starCount; index++) {
        this.ratingArr.push(index);
      }
    }
  }

  getStars(rating: number): string {
    const size = rating / this.defaultRating * 100;
    return size + '%';
  }

  onClick(rating: number): void {
    this.rating = rating;
    this.ratingUpdated.emit(rating);
  }

  showIcon(index: number): string {
    if (this.rating >= index + 1) {
      return 'star';
    }
    return 'star_border';
  }
}
