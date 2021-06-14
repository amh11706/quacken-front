import { Component, Input } from '@angular/core';

@Component({
  selector: 'q-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent {
  @Input() average: number = 0;
  @Input() count: number = 0;
  default_rating: number = 5;

  getStars(rating: number) {
    const size = rating / this.default_rating * 100;
    return size + '%';
  }
}
