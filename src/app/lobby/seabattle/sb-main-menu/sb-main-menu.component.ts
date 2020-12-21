import { Component } from '@angular/core';
import { MainMenuComponent } from '../../cadegoose/main-menu/main-menu.component';
import { SB_STATS } from '../sb-stats/sb-stats.component';

@Component({
  selector: 'q-sb-main-menu',
  templateUrl: './sb-main-menu.component.html',
  styleUrls: ['./sb-main-menu.component.scss']
})
export class SbMainMenuComponent extends MainMenuComponent {
  SB_STATS = SB_STATS;
}
