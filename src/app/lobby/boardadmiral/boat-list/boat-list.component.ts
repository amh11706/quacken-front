import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { QdragModule } from '../../../qdrag/qdrag.module';
import { BoatButtonComponent } from '../../../replay/boat-button/boat-button.component';
import { BoatsService } from '../../quacken/boats/boats.service';
import { Boat } from '../../quacken/boats/boat';
import { GuBoat } from '../../cadegoose/twod-render/gu-boats/gu-boat';
import { KeyBindingService } from '../../../settings/key-binding/key-binding.service';
import { KeyActions } from '../../../settings/key-binding/key-actions';

export const DefaultBoat = new Boat('Boat Defaults');

@Component({
  selector: 'q-boat-list',
  standalone: true,
  imports: [CommonModule, QdragModule, BoatButtonComponent],
  templateUrl: './boat-list.component.html',
  styleUrl: './boat-list.component.scss',
})
export class BoatListComponent implements OnInit, OnDestroy {
  boats: Boat[] = [];
  filteredBoats: Boat[] = [];
  @Output() boatsChange = new EventEmitter<Boat[]>();
  @Output() activeBoatChange = new EventEmitter<Boat>();
  @Input() fishnames = false;
  @Input() activeBoat = DefaultBoat;
  @Input() highlightedBoats = new Set<number>();
  DefaultBoat = DefaultBoat;

  private sub = new Subscription();

  constructor(private boatsService: BoatsService, private kbs: KeyBindingService) { }

  ngOnInit() {
    this.bindKeys();
    this.sub.add(this.boatsService.boats$.subscribe(boats => {
      DefaultBoat.team = GuBoat.myTeam;
      if (DefaultBoat.team === 99) {
        DefaultBoat.team = 4;
        DefaultBoat.pos = { x: 10, y: 18 };
      }
      this.boats = boats.filter(boat => boat.team === GuBoat.myTeam);
      this.boats.sort((a, b) => a.id - b.id);
      this.boatsChange.emit(this.boats);
      this.filteredBoats = this.boats.filter(boat => boat.moveLock === 0);
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

  selectBoat(boat: Boat): void {
    DefaultBoat.pos = { ...boat.pos };
    this.activeBoatChange.emit(boat);
    this.boatsService.focusMyBoat();
  }
}
