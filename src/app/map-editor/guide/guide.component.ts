import { Component } from '@angular/core';
import { EscMenuService } from '../../esc-menu/esc-menu.service';

@Component({
  selector: 'q-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss'],
  standalone: false,
})
export class GuideComponent {
  constructor(public es: EscMenuService) { }
}
