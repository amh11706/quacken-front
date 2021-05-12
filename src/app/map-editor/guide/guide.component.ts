import { Component } from '@angular/core';
import { EscMenuService } from 'src/app/esc-menu/esc-menu.service';

@Component({
  selector: 'q-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss']
})
export class GuideComponent {

  constructor(public es: EscMenuService) { }

}
