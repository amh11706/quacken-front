import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { QdragModule } from '../../../qdrag/qdrag.module';
import { BoatButtonComponent } from '../../../replay/boat-button/boat-button.component';
import { BoatsService } from '../../quacken/boats/boats.service';
import { Boat } from '../../quacken/boats/boat';
import { GuBoat } from '../../cadegoose/twod-render/gu-boats/gu-boat';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

export const DefaultBoat = new Boat('Boat Defaults')

@Component({
  selector: 'q-boat-list',
  standalone: true,
  imports: [CommonModule, QdragModule, BoatButtonComponent],
  templateUrl: './boat-list.component.html',
  styleUrl: './boat-list.component.scss'
})
export class BoatListComponent implements OnDestroy {
  boats: Boat[] = [];
  @Output() boatsChange = new EventEmitter<Boat[]>();
  @Output() activeBoatChange = new EventEmitter<Boat>();
  @Input() activeBoat = DefaultBoat;
  DefaultBoat = DefaultBoat;

  private sub = new Subscription();

  constructor(private boatsService: BoatsService) {
    this.sub.add(this.boatsService.boats$.subscribe(boats => {
      DefaultBoat.team = GuBoat.myTeam;
      if (DefaultBoat.team === 99) DefaultBoat.team = 0;
      this.boats = boats.filter(boat => boat.team === GuBoat.myTeam);
      this.boatsChange.emit(this.boats);
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  selectBoat(boat: Boat): void {
    DefaultBoat.pos = { ...boat.pos };
    this.activeBoatChange.emit(boat);
    this.boatsService.focusMyBoat();
  }
}
