import { Component, Input } from '@angular/core';
import { Orientation } from '../sprite';

interface Sprite{
  img?: string;
  imgPosition?: string;
  orientation?: Orientation;
  orientations?: { [key: string]: Orientation };
}

@Component({
  selector: 'q-sprite-img',
  templateUrl: './sprite-img.component.html',
  styleUrls: ['./sprite-img.component.scss'],
})
export class SpriteImgComponent {
  @Input() render = {} as Sprite;
}
