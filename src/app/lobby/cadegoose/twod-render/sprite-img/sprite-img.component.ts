import { Component, Input } from '@angular/core';
import { Orientation } from '../sprite';

interface Sprite {
  img?: string;
  imgPosition?: string;
  orientation?: Orientation;
  orientations?: { [key: string]: Orientation };
}

@Component({
  selector: 'q-sprite-img',
  templateUrl: './sprite-img.component.html',
  styleUrl: './sprite-img.component.scss',
  standalone: false,
})
export class SpriteImgComponent {
  @Input() render = {} as Sprite;
}
