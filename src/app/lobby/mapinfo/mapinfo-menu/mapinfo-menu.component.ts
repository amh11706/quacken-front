import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';

@Component({
    selector: 'q-mapinfo-menu',
    imports: [MatCardModule, MatButtonModule],
    templateUrl: './mapinfo-menu.component.html',
    styleUrl: './mapinfo-menu.component.scss'
})
export class MapinfoMenuComponent {
  constructor(public es: EscMenuService) {}
}
