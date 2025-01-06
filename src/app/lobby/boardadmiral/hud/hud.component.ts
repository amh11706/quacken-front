import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatModule } from '../../../chat/chat.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CadeHudComponent } from '../../cadegoose/hud/hud.component';
import { CommonModule } from '@angular/common';
import { BABoatSettings } from '../ba-render';
import { DefaultBoat } from '../boat-list/boat-list.component';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'q-ba-hud',
  standalone: true,
  imports: [CommonModule, ChatModule, MatTooltipModule, MatIconModule, MatButtonModule, MatSliderModule],
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.scss'
})
export class HudComponent extends CadeHudComponent {
  @Input() activeBoat = new BABoatSettings(DefaultBoat, this.ws);
  @Output() activeBoatChange = new EventEmitter<BABoatSettings>();
  @Input() boatSettings = new Map<number, BABoatSettings>();

  syncToOtherBoats(key: 'Aggro' | 'Defense' | 'Flag'): void {
    this.boatSettings.forEach(boat => {
      boat[key] = this.activeBoat[key];
      boat.save();
    });
  }

  update(): void {
    this.activeBoat.save();
    this.activeBoatChange.emit(this.activeBoat);
  }

}
