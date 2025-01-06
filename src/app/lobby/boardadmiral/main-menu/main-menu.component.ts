import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'q-ba-main-menu',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class BaMainMenuComponent {
  constructor(public es: EscMenuService) { }
}
