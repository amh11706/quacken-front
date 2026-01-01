import { Component, inject } from '@angular/core';
import { EscMenuService } from '../../esc-menu/esc-menu.service';

@Component({
  selector: 'q-guide',
  templateUrl: './guide.component.html',
  styleUrl: './guide.component.scss',
  standalone: false,
})
export class GuideComponent {
  es = inject(EscMenuService);
}
