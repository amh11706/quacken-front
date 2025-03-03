import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'q-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class RatingComponent implements OnInit {
  @Output() ratingUpdated = new EventEmitter<number>();
  @Input() rating?: number;
  @Input() myRating?: number;
  @Input() isPecentage = false; // determines when to use specific template
  @Input() forTags = false;
  @Input() count = 0;
  starCount = 5;
  defaultRating = 5;
  ratingArr: number[] = [];

  ngOnInit(): void {
    for (let index = 0; index < this.starCount; index++) {
      this.ratingArr.push(index);
    }
  }

  getStars(rating: number): string {
    const size = rating / this.defaultRating * 100;
    return size + '%';
  }

  onClick(rating: number): void {
    if (this.count === 0) this.count = 1;
    else if (!this.myRating) this.count += 1;
    this.myRating = rating;
    this.ratingUpdated.emit(rating);
  }

  showIcon(index: number): string {
    if (this.myRating && this.myRating >= index + 1) {
      return 'star';
    }
    return 'star_border';
  }
}
