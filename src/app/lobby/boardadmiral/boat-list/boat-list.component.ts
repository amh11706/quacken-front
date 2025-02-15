import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QdragModule } from '../../../qdrag/qdrag.module';
import { BoatButtonComponent } from '../../../replay/boat-button/boat-button.component';
import { BoatsService } from '../../quacken/boats/boats.service';
import { Boat } from '../../quacken/boats/boat';
import { GuBoat } from '../../cadegoose/twod-render/gu-boats/gu-boat';
import { KeyBindingService } from '../../../settings/key-binding/key-binding.service';
import { KeyActions } from '../../../settings/key-binding/key-actions';
import { SettingsModule } from '../../../settings/settings.module';
import { WsService } from '../../../ws/ws.service';
import { OutCmd } from '../../../ws/ws-messages';
import { BoatTypes } from '../../quacken/boats/boat-types';
import { SettingsService } from '../../../settings/settings.service';
import { ShipListComponent, ShipTypeMap } from '../../../settings/ship-list/ship-list.component';

export const DefaultBoat = new Boat('Boat Defaults');
DefaultBoat.team = 99;

@Component({
  selector: 'q-boat-list',
  standalone: true,
  imports: [
    CommonModule,
    QdragModule,
    BoatButtonComponent,
    SettingsModule,
    MatTabsModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './boat-list.component.html',
  styleUrl: './boat-list.component.scss',
})
export class BoatListComponent implements OnInit, OnDestroy {
  boats: Boat[] = [];
  filteredBoats: Boat[] = [];
  @Output() boatsChange = new EventEmitter<Boat[]>();
  @Output() activeBoatChange = new EventEmitter<Boat>();
  @Input() fishNames = false;
  @Input() activeBoat = DefaultBoat;
  @Input() highlightedBoats = new Set<number>();
  DefaultBoat = DefaultBoat;

  ShipTypeMap = ShipTypeMap;
  settings = this.ss.prefetch('l/cade');
  spawnBoats: Boat[] = [];
  boatTypes: BoatTypes[] = [];
  cost = 0;

  private sub = new Subscription();

  constructor(
    private boatsService: BoatsService,
    private kbs: KeyBindingService,
    private ws: WsService,
    private ss: SettingsService,
  ) { }

  ngOnInit() {
    this.bindKeys();
    this.sub.add(this.boatsService.boats$.subscribe(boats => {
      DefaultBoat.team = GuBoat.myTeam;
      if (DefaultBoat.team === 99) {
        DefaultBoat.team = 4;
        DefaultBoat.pos = { x: 10, y: 18 };
      }
      this.boats = boats.filter(boat => boat.team === GuBoat.myTeam && boat.moveLock < 100);
      this.boats.sort((a, b) => {
        if (a.type !== b.type) return b.type - a.type;
        return a.id - b.id;
      });
      this.boatsChange.emit(this.boats);
      this.filteredBoats = this.boats.filter(boat => boat.moveLock === 0);
      this.boatTypes = this.boats.map(boat => boat.type);
      this.spawnBoats = this.filteredBoats.filter(boat => boat.inSZ);
      this.cost = ShipListComponent.getCost(this.boatTypes);
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  static boatJumpKeys = [
    KeyActions.BA1stShip,
    KeyActions.BA2ndShip,
    KeyActions.BA3rdShip,
    KeyActions.BA4thShip,
    KeyActions.BA5thShip,
  ];

  private bindKeys(): void {
    BoatListComponent.boatJumpKeys.forEach((key, i) => {
      this.sub.add(this.kbs.subscribe(key, v => {
        if (!v) return;
        const boat = this.boats[i + 1];
        if (boat) this.selectBoat(boat);
      }));
    });

    this.sub.add(this.kbs.subscribe(KeyActions.BANextShip, v => {
      if (!v) return;
      const idx = this.filteredBoats.indexOf(this.activeBoat) || 0;
      const boat = this.filteredBoats[(idx + 1) % this.filteredBoats.length];
      if (boat) this.selectBoat(boat);
    }));
    this.sub.add(this.kbs.subscribe(KeyActions.BAPrevShip, v => {
      if (!v) return;
      const idx = this.filteredBoats.indexOf(this.activeBoat) || 0;
      const boat = this.filteredBoats[(idx - 1 + this.filteredBoats.length) % this.filteredBoats.length];
      if (boat) this.selectBoat(boat);
    }));
  }

  hasCoverage(boat: Boat): boolean {
    return boat.attr?.[51] !== 1;
  }

  selectBoat(boat: Boat): void {
    DefaultBoat.pos = { ...boat.pos };
    this.activeBoatChange.emit(boat);
    this.boatsService.focusMyBoat();
  }

  async addBoat(id: BoatTypes): Promise<void> {
    const boatId = await this.ws.request(OutCmd.BAAddBoat, id);
    const boat = this.boats.find(b => b.id === boatId);
    if (boat) this.selectBoat(boat);
  }

  removeBoat(id: number): void {
    this.ws.send(OutCmd.BARemoveBoat, id);
  }
}
