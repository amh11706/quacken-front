import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { LetDirective } from '@ngrx/component';

import { BABoatSettings, BoatCoverMode } from '../ba-render';
import { CadeHudComponent } from '../../cadegoose/hud/hud.component';
import { ChatModule } from '../../../chat/chat.module';
import { OutCmd } from '../../../ws/ws-messages';

@Component({
  selector: 'q-ba-hud',
  standalone: true,
  imports: [CommonModule, LetDirective,
    ChatModule, MatTooltipModule, MatIconModule, MatButtonModule, MatSliderModule, MatSelectModule],
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.scss',
})
export class HudComponent extends CadeHudComponent {
  @Input() fishnames = false;
  @Input() boatSettings = new Map<number, BABoatSettings>();
  private _activeBoat?: BABoatSettings;
  @Input() set activeBoat(value: BABoatSettings | undefined) {
    this._activeBoat = value;
    this.buildBoatList();
  };

  get activeBoat(): BABoatSettings | undefined {
    return this._activeBoat;
  }

  @Output() activeBoatChange = new EventEmitter<BABoatSettings>();

  boatList: BABoatSettings[] = [];
  selectedBoat: BABoatSettings | undefined;

  private buildBoatList(): void {
    const boat = this.activeBoat?.boat;
    if (!boat) return;
    this.boatList = Array.from(this.boatSettings.values()).filter(boat => {
      return boat.boat.id !== 0 && boat !== this.activeBoat && boat.boat.moveLock < 99;
    });
    this.boatList.sort((a, b) => {
      const aDistance = (a.boat.pos.x - boat.pos.x) ** 2 + (a.boat.pos.y - boat.pos.y) ** 2;
      const bDistance = (b.boat.pos.x - boat.pos.x) ** 2 + (b.boat.pos.y - boat.pos.y) ** 2;
      return bDistance - aDistance;
    });
    this.selectedBoat = this.boatList[0];
  }

  swapBoat?: BABoatSettings;

  swapCoverageWith(boat: BABoatSettings): void {
    if (!this.activeBoat) return;
    const tempCoverage = this.activeBoat.coverage;
    const tempCoverMode = this.activeBoat.coverMode;
    this.activeBoat.coverage = boat.coverage;
    this.activeBoat.coverMode = boat.coverMode;
    boat.coverage = tempCoverage;
    boat.coverMode = tempCoverMode;
    boat.save();
    this.update();
  }

  copyBoat?: BABoatSettings;

  copyCoverageTo(boat: BABoatSettings): void {
    if (!this.activeBoat) return;
    boat.coverage = {
      [BoatCoverMode.Flags]: [...this.activeBoat.coverage[BoatCoverMode.Flags]],
      [BoatCoverMode.Tiles]: [...this.activeBoat.coverage[BoatCoverMode.Tiles]],
    };
    boat.coverMode = this.activeBoat.coverMode;
    boat.save();
    this.update();
  }

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

  boatName(boat: BABoatSettings): string {
    return this.fishnames ? boat.boat.name : boat.boat.title;
  }

  update(): void {
    if (!this.activeBoat) return;
    // simplify aggro/defense to inverse of each other to free up space
    this.activeBoat.Defense = 100 - this.activeBoat.Aggro;
    this.activeBoatChange.emit(this.activeBoat);
  }

  resetCoverage(): void {
    if (!this.activeBoat) return;
    for (const i in this.activeBoat.coverage) this.activeBoat.coverage[+i as BoatCoverMode] = [];
    this.update();
  }

  getDamageReport() {
    void this.ws.request(OutCmd.BADamageReport, this.activeBoat?.boat.id || 0);
  }

  toggleSink() {
    void this.ws.request(OutCmd.BAToggleSink, this.activeBoat?.boat.id || 0);
  }
}
