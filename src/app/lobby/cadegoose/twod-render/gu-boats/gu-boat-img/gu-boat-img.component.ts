import { Component, Input } from '@angular/core';
import { GuBoat } from '../gu-boat';

@Component({
  selector: 'q-gu-boat-img',
  templateUrl: './gu-boat-img.component.html',
  styleUrl: './gu-boat-img.component.scss',
})
export class GuBoatImgComponent {
  @Input() render = {} as GuBoat;
}
