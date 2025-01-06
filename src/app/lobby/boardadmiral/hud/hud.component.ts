import { Component, Input } from '@angular/core';
import { ChatModule } from '../../../chat/chat.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CadeHudComponent } from '../../cadegoose/hud/hud.component';
import { CommonModule } from '@angular/common';
import { BABoatSettings } from '../ba-render';
import { DefaultBoat } from '../boat-list/boat-list.component';

@Component({
  selector: 'q-ba-hud',
  standalone: true,
  imports: [CommonModule, ChatModule, MatTooltipModule, MatIconModule, MatButtonModule],
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.scss'
})
export class HudComponent extends CadeHudComponent {
  @Input() activeBoat = new BABoatSettings(DefaultBoat);
  @Input() boatSettings = new Map<number, BABoatSettings>();
}
