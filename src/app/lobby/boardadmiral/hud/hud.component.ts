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
import { InCmd, OutCmd } from '../../../ws/ws-messages';
import { KeyActions } from '../../../settings/key-binding/key-actions';

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
    if (this.waitingForBoat) {
      this.waitingForBoat = false;
      if (value) this.activeCommand.boatTrigger?.(value);
    }

    this._activeBoat = value;
    this.buildBoatList();
  };

  get activeBoat(): BABoatSettings | undefined {
    return this._activeBoat;
  }

  @Output() activeBoatChange = new EventEmitter<BABoatSettings>();

  readonly BoatCommands = [
    {
      name: 'damage Report',
      tooltip: 'Get estimated damage for nearby boats',
      type: 'button',
      text: 'Request',
      trigger: this.getDamageReport.bind(this),
      icon: 'report_problem',
    },
    {
      name: 'toggle Sink',
      tooltip: 'Mark this boat to be sunk by your team',
      type: 'button',
      text: 'Request',
      trigger: this.toggleSink.bind(this),
      icon: 'sailing',
    },
    {
      name: 'swap with',
      tooltip: 'Swap coverage with a selected boat',
      type: 'boat',
      text: 'Select',
      trigger: this.startSwap.bind(this),
      boatTrigger: this.swapCoverageWith.bind(this),
      icon: 'swap_horiz',
    },
  ];

  activeCommand = this.BoatCommands[0]!;
  boatList: BABoatSettings[] = [];

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
  }

  protected bindKeys(): void {
    this.subs.add(this.kbs.subscribe(KeyActions.BACoverFlags, v => {
      if (!v || !this.activeBoat) return;
      if (this.activeBoat.coverMode === BoatCoverMode.Flags) return;
      this.activeBoat.coverMode = BoatCoverMode.Flags;
      this.update();
    }));
    this.subs.add(this.kbs.subscribe(KeyActions.BACoverTiles, v => {
      if (!v || !this.activeBoat) return;
      if (this.activeBoat.coverMode === BoatCoverMode.Tiles) return;
      this.activeBoat.coverMode = BoatCoverMode.Tiles;
      this.update();
    }));
    this.subs.add(this.kbs.subscribe(KeyActions.BAResetCoverage, v => {
      if (!v || !this.activeBoat) return;
      this.resetCoverage();
    }));

    this.subs.add(this.kbs.subscribe(KeyActions.BADecreaseAggro, v => {
      if (!v || !this.activeBoat) return;
      if (this.activeBoat.Aggro <= 0) return;
      this.activeBoat.Aggro -= 10;
      this.update();
    }));
    this.subs.add(this.kbs.subscribe(KeyActions.BAIncreaseAggro, v => {
      if (!v || !this.activeBoat) return;
      if (this.activeBoat.Aggro >= 100) return;
      this.activeBoat.Aggro += 10;
      this.update();
    }));
    this.subs.add(this.kbs.subscribe(KeyActions.BASyncAggro, v => {
      if (!v || !this.activeBoat) return;
      this.syncToOtherBoats('Aggro');
    }));

    this.subs.add(this.kbs.subscribe(KeyActions.BADamageReport, v => {
      if (!v || !this.activeBoat) return;
      this.getDamageReport();
    }));
    this.subs.add(this.kbs.subscribe(KeyActions.BAToggleSink, v => {
      if (!v || !this.activeBoat) return;
      this.toggleSink();
    }));
  }

  swapCoverageWith(boat: BABoatSettings): void {
    if (!this.activeBoat) return;
    const activeCoverage = this.activeBoat.coverage;
    const activeCoverMode = this.activeBoat.coverMode;
    const boatCoverage = boat.coverage;
    const boatCoverMode = boat.coverMode;

    this.activeBoat.coverage = boatCoverage;
    this.activeBoat.coverMode = boatCoverMode;
    boat.coverage = activeCoverage;
    boat.coverMode = activeCoverMode;

    if (!this.activeBoat.isCoveragePossible() || !boat.isCoveragePossible()) {
      this.activeBoat.coverage = activeCoverage;
      this.activeBoat.coverMode = activeCoverMode;
      boat.coverage = boatCoverage;
      boat.coverMode = boatCoverMode;
      this.notifyError('Swap with');
      return;
    }

    this.ws.send(OutCmd.BASwapBoat, { from: this.activeBoat.boat.id, to: boat.boat.id });
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
    this.activeBoat.clearCoverage();
    this.update();
  }

  getDamageReport() {
    void this.ws.send(OutCmd.BADamageReport, this.activeBoat?.boat.id || 0);
  }

  toggleSink() {
    void this.ws.send(OutCmd.BAToggleSink, this.activeBoat?.boat.id || 0);
  }

  waitingForBoat = false;
  startSwap(): void {
    this.activeCommand = this.BoatCommands[2]!;
    this.waitingForBoat = true;
  }

  private notifyError(command: 'Swap with' | 'Copy to' | 'Copy from'): void {
    void this.ws.dispatchMessage({
      cmd: InCmd.ChatMessage,
      data: { type: 0, message: `'${command.toLowerCase()}' failed. New coverage not possible.`, from: '' },
    });
  }
}
