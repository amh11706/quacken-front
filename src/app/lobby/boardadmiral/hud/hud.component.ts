import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatModule } from '../../../chat/chat.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CadeHudComponent } from '../../cadegoose/hud/hud.component';
import { CommonModule } from '@angular/common';
import { BABoatSettings, BoatCoverMode } from '../ba-render';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'q-ba-hud',
  standalone: true,
  imports: [CommonModule, ChatModule, MatTooltipModule, MatIconModule, MatButtonModule, MatSliderModule],
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.scss'
})
export class HudComponent extends CadeHudComponent {
  @Input() activeBoat?: BABoatSettings;
  @Output() activeBoatChange = new EventEmitter<BABoatSettings>();
  @Input() boatSettings = new Map<number, BABoatSettings>();

  syncToOtherBoats(key: 'Aggro' | 'Defense' | 'Flag'): void {
    if (!this.activeBoat) return;
    this.boatSettings.forEach(boat => {
      if (!this.activeBoat) return;
      if (boat.boat.id === 0) return;
      if (boat === this.activeBoat) return;
      if (boat[key] === this.activeBoat[key]) return;
      boat[key] = this.activeBoat[key];
      boat.save();
    });
  }

  update(): void {
    if (!this.activeBoat) return;
    this.activeBoatChange.emit(this.activeBoat);
  }

  resetCoverage(): void {
    if (!this.activeBoat) return;
    for (const i in this.activeBoat.coverage) this.activeBoat.coverage[+i as BoatCoverMode] = [];
    this.update();
  }
}
