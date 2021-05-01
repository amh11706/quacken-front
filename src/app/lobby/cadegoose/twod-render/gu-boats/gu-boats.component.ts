import { Component, Input, OnInit } from '@angular/core';
import { BoatService } from '../../boat.service';
import { GuBoat, Point } from './gu-boat';
import { WsService } from 'src/app/ws.service';
import { Boat } from 'src/app/lobby/quacken/boats/boat';
import { Turn, Clutter } from 'src/app/lobby/quacken/boats/boats.component';

const FlagColorOffsets: Record<number, number> = {
  0: 3,
  1: 6,
  98: 0,
  99: 9,
  100: 12,
};

@Component({
  selector: 'q-gu-boats',
  templateUrl: './gu-boats.component.html',
  styleUrls: ['./gu-boats.component.scss'],
})
export class GuBoatsComponent extends BoatService implements OnInit {
  @Input() showIsland = false;
  @Input() speed = 15;
  @Input() hoveredTeam = -1;
  @Input() map?: HTMLElement;
  @Input() getX = (p: { x: number, y: number }): number => (p.x + p.y) * 32;
  @Input() getY = (p: { x: number, y: number }): number => (p.y - p.x + 19) * 24;
  moveTransition = (transition: number): string => {
    switch (transition) {
      case 0: return '0s linear';
      case 1: return 10 / this.speed + 's linear';
      case 2:
      case 3:
      case 4: return 6 / this.speed + 's linear';
      default: return '';
    }
  }

  constructor(ws: WsService) {
    super(ws);
    this.blockRender = false;
  }

  ngOnInit() {
    // empty to prevent double init thanks to extended class not being a component
  }

  render(boat: Boat): GuBoat {
    return (boat.render || { orientation: {} }) as GuBoat;
  }

  protected handleUpdate(updates: Clutter[]) {
    for (const u of updates) {
      const p = new Point().fromPosition(u);
      u.transform = `translate(${p.x}px, ${p.y}px)`;
    }
    this.clutter.push(...updates);
  }

  protected setHeaderFlags(flags: Turn['flags']) {
    for (const boat of this.boats) if (boat.render) boat.render.flags = [];
    for (const f of flags) {
      if (f.cs) for (const id of f.cs) {
        const team = f.t === this.myBoat.team ? 98 : f.t;
        this._boats[id]?.render?.flags.push({
          p: f.p, t: f.t, offset: 160 - (FlagColorOffsets[team] + f.p) * 10 + 'px',
        } as any);
      }
    }
    for (const boat of this.boats) {
      if (!boat.render) continue;
      boat.render.flags.sort((a, b) => {
        if (a.p > b.p) return -1;
        if (a.p < b.p) return 1;
        return b.t - a.t;
      });
    }
  }

  protected checkNewShips() {
    for (const boat of this.boats) {
      if (boat.render) continue;
      let newBoat = this._boats[boat.id];
      if (!newBoat || newBoat.render && boat.render !== newBoat.render) newBoat = this._boats[-boat.id];
      if (!newBoat || newBoat.render) continue;
      boat.render = new GuBoat(boat, undefined as any);
    }
    return [];
  }
}
